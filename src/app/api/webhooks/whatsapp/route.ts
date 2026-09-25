import { NextRequest, NextResponse } from "next/server";
import { findLeadByPhoneGlobal, updateLeadStatusGlobal } from "@/lib/repo/leads";
import { addEvent, listEventsForLead } from "@/lib/repo/events";
import { getActiveScript } from "@/lib/repo/scripts";
import { generateAgentResponse } from "@/lib/ai/responder";
import { sendWhatsAppMessage } from "@/lib/integrations/whatsapp";
import prisma from "@/lib/prisma";
// Desafio de verificação do Webhook (Meta)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  if (mode && token) {
    if (mode === "subscribe" && token === verifyToken) {
      console.log("Webhook do WhatsApp verificado com sucesso!");
      return new NextResponse(challenge, { status: 200 });
    }
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// Receber mensagens (Inbound)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validação de token via header desabilitada temporariamente para simplificar
    // Integração direta com Z-API assumindo webhook seguro.

    // O Z-API envia mensagens em vários formatos. Queremos ignorar mensagens de grupo e do próprio sistema
    if (body.isGroup) {
      return NextResponse.json({ ok: true, ignored: "group_message" }, { status: 200 });
    }

    if (!body.phone) {
      return NextResponse.json({ ok: true, ignored: "no_phone" }, { status: 200 });
    }

    const fromNumber = body.phone; // Z-API já envia como 5511999999999
    
    // Z-API estrutura texto em body.text.message. Para áudios/imagens pode vir em body.audio / body.image
    let messageText = "[Mensagem de mídia/não suportada]";
    if (body.text && body.text.message) {
      messageText = body.text.message;
    }

    console.log(`Mensagem recebida do Z-API: ${fromNumber} - ${messageText}`);

    // Buscar o lead pelo telefone
    let lead = await findLeadByPhoneGlobal(fromNumber);

    if (!lead) {
      console.warn(`Lead não encontrado para o número: ${fromNumber}. Criando um lead não cadastrado...`);
      // Pega o primeiro usuário admin ou qualquer usuário para ser o "dono" do lead.
      const defaultUser = await prisma.user.findFirst({
        orderBy: { createdAt: "asc" }
      });
      if (defaultUser) {
        lead = await prisma.lead.create({
          data: {
            userId: defaultUser.id,
            name: "Não Cadastrado",
            whatsapp: fromNumber,
            phone: fromNumber,
            mode: "MODO_1",
            status: "NOVO"
          }
        }) as any;
      }
    }

    if (lead) {
      // Salvar o evento de conversa (entrada)
      await addEvent({
        leadId: lead.id,
        channel: "WHATSAPP",
        direction: "ENTRADA",
        content: messageText,
      });

      // Atualizar status para RESPONDENDO se não estiver em estágio final
      if (lead.status !== "FECHADO" && lead.status !== "PERDIDO") {
        await updateLeadStatusGlobal(lead.id, "RESPONDENDO");
      }

      // Buscar o script ativo
      const script = await getActiveScript(lead.mode, "WHATSAPP");
      
      if (script) {
        // Obter histórico
        const events = await listEventsForLead(lead.id, lead.userId);
        const history = events.map(e => ({
          role: e.direction === "ENTRADA" ? "user" : "assistant",
          content: e.content
        })) as { role: "user" | "assistant", content: string }[];

        // Chamar AI
        const aiReply = await generateAgentResponse(lead.id, script.content, history);

        if (aiReply) {
          // Enviar resposta
          const sendRes = await sendWhatsAppMessage({
            leadId: lead.id,
            to: fromNumber,
            message: aiReply,
          });

          if (sendRes.ok) {
            // Salvar saída
            await addEvent({
              leadId: lead.id,
              channel: "WHATSAPP",
              direction: "SAIDA",
              content: aiReply,
              scriptId: script.id,
            });
          } else {
            console.error("Falha ao enviar mensagem de volta para o cliente:", sendRes.error);
          }
        } else {
          console.warn(`aiReply retornou nulo ou vazio para o lead ${lead.id}`);
        }
      } else {
        console.warn(`Nenhum script ativo encontrado para o lead ${lead.id}`);
      }
    } else {
      console.warn(`Não foi possível criar ou encontrar lead para o número: ${fromNumber}`);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Erro ao processar webhook do Z-API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
