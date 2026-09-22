import OpenAI from "openai";
import prisma from "@/lib/prisma";
import { createMeetingEvent } from "@/lib/integrations/googleCalendar";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "schedule_meeting",
      description: "Agenda uma reunião no Google Calendar e no sistema para o cliente.",
      parameters: {
        type: "object",
        properties: {
          startTimeIso: {
            type: "string",
            description: "Data e hora de início no formato ISO 8601 (ex: 2026-09-25T14:00:00-03:00). Sempre use o fuso horário de Brasília (UTC-3).",
          },
          endTimeIso: {
            type: "string",
            description: "Data e hora de término no formato ISO 8601.",
          },
          description: {
            type: "string",
            description: "Notas opcionais sobre a reunião ou assunto.",
          },
        },
        required: ["startTimeIso", "endTimeIso"],
      },
    },
  },
];

export async function generateAgentResponse(
  leadId: string,
  systemPrompt: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[]
): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("⚠️ OPENAI_API_KEY não configurada.");
    return "Olá! Eu sou o assistente IA. Infelizmente estou temporariamente fora do ar. Retornarei em breve!";
  }

  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { user: true },
    });

    if (!lead) return null;

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `Você é um Assistente de Vendas IA (criado por ${lead.user.name}).
Sua missão é conversar com o cliente, responder dúvidas e marcar uma reunião (call) se houver intenção.
Hoje é: ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })} (Horário de Brasília).
Nome do Cliente (se souber): ${lead.name !== "Novo Contato" ? lead.name : "Cliente"}
Instruções de Comportamento (Script Ativo):
${systemPrompt}`,
      },
      ...conversationHistory,
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      tools,
      tool_choice: "auto",
      temperature: 0.7,
    });

    const responseMessage = response.choices[0].message;

    // Se o modelo decidiu chamar uma tool (ex: agendar reunião)
    if (responseMessage.tool_calls) {
      for (const toolCall of responseMessage.tool_calls) {
        if (toolCall.function.name === "schedule_meeting") {
          const args = JSON.parse(toolCall.function.arguments);
          
          // Chama o Google Calendar
          const gcalRes = await createMeetingEvent({
            userId: lead.userId,
            leadName: lead.name,
            leadPhone: lead.phone || lead.whatsapp || "Desconhecido",
            startTimeIso: args.startTimeIso,
            endTimeIso: args.endTimeIso,
            description: args.description,
          });

          if (gcalRes.ok) {
            // Salva a Meeting no banco de dados local
            await prisma.meeting.upsert({
              where: { leadId: lead.id },
              update: {
                scheduledAt: new Date(args.startTimeIso),
                status: "AGENDADA",
                notes: `Link GCal: ${gcalRes.htmlLink}\n${args.description || ""}`,
              },
              create: {
                leadId: lead.id,
                scheduledAt: new Date(args.startTimeIso),
                status: "AGENDADA",
                notes: `Link GCal: ${gcalRes.htmlLink}\n${args.description || ""}`,
              },
            });

            // Atualiza o status do Lead
            await prisma.lead.update({
              where: { id: lead.id },
              data: { status: "REUNIAO_AGENDADA" },
            });

            // Retorna a segunda chamada à API passando o resultado da tool
            messages.push(responseMessage);
            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: `Reunião agendada com sucesso! Link: ${gcalRes.htmlLink}`,
            });

            const secondResponse = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages,
            });

            return secondResponse.choices[0].message.content;
          } else {
            // Falha ao agendar
            messages.push(responseMessage);
            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: `Erro ao agendar reunião: ${gcalRes.error}. Informe ao cliente que houve um erro técnico.`,
            });
            const errorResponse = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages,
            });
            return errorResponse.choices[0].message.content;
          }
        }
      }
    }

    return responseMessage.content;
  } catch (error) {
    console.error("Erro na OpenAI / Responder:", error);
    return "Desculpe, tive um pequeno problema técnico aqui. Pode repetir por favor?";
  }
}
