import OpenAI from "openai";
import prisma from "@/lib/prisma";
import { createMeetingEvent } from "@/lib/integrations/googleCalendar";

const getOpenAIClient = () => new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-build",
});

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "schedule_meeting",
      description: "Agenda uma reunião no Google Calendar e no sistema para o cliente. OBRIGATÓRIO: você precisa pedir o e-mail do cliente ANTES de chamar essa função para enviar o convite.",
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
          leadEmail: {
            type: "string",
            description: "E-mail do cliente para enviar o convite do Google Calendar.",
          },
          description: {
            type: "string",
            description: "Notas opcionais sobre a reunião ou assunto.",
          },
        },
        required: ["startTimeIso", "endTimeIso", "leadEmail"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "register_lead",
      description: "Registra os dados do cliente (nome e email) no sistema quando ele ainda não está cadastrado. Chame esta função apenas quando o cliente não cadastrado fornecer os dados solicitados.",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Nome completo do cliente",
          },
          email: {
            type: "string",
            description: "E-mail do cliente",
          },
        },
        required: ["name", "email"],
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
Nome do Cliente (se souber): ${lead.name !== "Não Cadastrado" ? lead.name : "Cliente"}

${lead.name === "Não Cadastrado" ? `
REGRA CRÍTICA PARA CLIENTES NÃO CADASTRADOS:
Notei que este cliente não está cadastrado em nosso sistema.
Sua prioridade máxima inicial é cumprimentar o cliente, perguntar como pode ajudá-lo e INFORMAR que ele não está cadastrado, solicitando gentilmente seus dados: Nome Completo e E-mail (o telefone já temos).
Exemplo: "Olá! Bom dia, como posso ajudar? Vi aqui que você não está cadastrado em nosso sistema. Poderia me passar seu nome completo e e-mail para eu realizar seu cadastro?"
Assim que o cliente fornecer os dados, chame IMEDIATAMENTE a ferramenta 'register_lead' com o nome e e-mail.
Só depois disso, siga com o script normal de vendas.
` : `
REGRA CRÍTICA PARA AGENDAMENTO DE REUNIÃO:
Se o cliente quiser marcar a reunião e vocês definirem um horário, você deve OBRIGATORIAMENTE pedir o e-mail dele ANTES de chamar a função 'schedule_meeting'. Diga algo como: "Perfeito, agendado! Por favor, qual é o seu melhor e-mail para eu te enviar o convite na agenda?". Somente depois de ele informar o e-mail, você chama a ferramenta.
`}

Instruções de Comportamento (Script Ativo):
${systemPrompt}`,
      },
      ...conversationHistory,
    ];

    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      tools,
      tool_choice: "auto",
      temperature: 0.7,
    });

    const responseMessage = response.choices[0].message;
    console.log("OpenAI Response:", JSON.stringify(responseMessage, null, 2));

    // Se o modelo decidiu chamar uma tool (ex: agendar reunião)
    if (responseMessage.tool_calls) {
      for (const toolCall of responseMessage.tool_calls) {
        if (toolCall.type === "function" && toolCall.function.name === "schedule_meeting") {
          const args = JSON.parse(toolCall.function.arguments);
          
          // Chama o Google Calendar
          const gcalRes = await createMeetingEvent({
            userId: lead.userId,
            leadName: lead.name,
            leadPhone: lead.phone || lead.whatsapp || "Desconhecido",
            leadEmail: args.leadEmail,
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
        } else if (toolCall.type === "function" && toolCall.function.name === "register_lead") {
          const args = JSON.parse(toolCall.function.arguments);
          
          await prisma.lead.update({
            where: { id: lead.id },
            data: {
              name: args.name,
              email: args.email,
            },
          });

          messages.push(responseMessage);
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: `Cadastro realizado com sucesso! Dados salvos: Nome = ${args.name}, Email = ${args.email}.`,
          });

          const secondResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
          });

          return secondResponse.choices[0].message.content;
        } else {
          console.warn(`Tool call não suportado: ${toolCall.type === "function" ? toolCall.function.name : toolCall.type}`);
        }
      }
      // Se chamou tools, mas o content ainda é nulo e não retornamos de dentro do loop
      if (!responseMessage.content) {
        console.warn("OpenAI retornou tool_calls mas o content está vazio após processamento.");
        return "Estou verificando sua solicitação...";
      }
    }

    if (!responseMessage.content) {
      console.warn("OpenAI retornou content nulo e sem tool_calls válidos.");
      return "Desculpe, pode reformular?";
    }

    return responseMessage.content;
  } catch (error) {
    console.error("Erro na OpenAI / Responder:", error);
    return "Desculpe, tive um pequeno problema técnico aqui. Pode repetir por favor?";
  }
}
