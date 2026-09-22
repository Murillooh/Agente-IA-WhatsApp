import { getLead, updateLeadStatus } from "@/lib/repo/leads";
import { addEvent } from "@/lib/repo/events";
import { getActiveScript } from "@/lib/repo/scripts";
import { sendWhatsAppMessage } from "@/lib/integrations/whatsapp";
import { sendInstagramMessage } from "@/lib/integrations/instagram";
import { makeCall } from "@/lib/integrations/voice";
import type { Lead } from "@/lib/types";

/**
 * Orquestra um "disparo" de automação para um lead: manda a mensagem de
 * prospecção pelos canais disponíveis (WhatsApp/Instagram) e, se o lead
 * estiver no Modo 2, também dispara a ligação com IA de voz. Cada etapa
 * gera um evento na timeline do lead (o "esboço" da conversa).
 *
 * Isso é chamado por leads individuais em src/app/api/leads/[id]/run/route.ts.
 * Para disparar vários leads ao mesmo tempo (várias ligações simultâneas),
 * o mesmo endpoint aceita uma lista de ids e roda em paralelo — veja
 * makeCallsBatch em src/lib/integrations/voice.ts.
 */
export async function runAutomationForLead(leadId: string, userId: string) {
  const lead = await getLead(leadId, userId);
  if (!lead) throw new Error("Lead não encontrado");

  const steps: string[] = [];

  // 1) WhatsApp, se houver número
  if (lead.whatsapp) {
    const script = await getActiveScript(lead.mode, "WHATSAPP");
    
    // Pede para a IA gerar a primeira mensagem de prospecção usando o script (prompt)
    let message = `Oi ${lead.name !== "Novo Contato" ? lead.name : ""}! Tudo bem?`;
    try {
      // Importa dinamicamente para evitar ciclo de dependências, se houver
      const { generateAgentResponse } = await import("@/lib/ai/responder");
      const systemPrompt = script?.content || "";
      const aiResponse = await generateAgentResponse(leadId, systemPrompt, [
        { 
          role: "user", 
          content: `(Instrução de sistema oculta) O lead acabou de entrar. Inicie a conversa de forma proativa (outbound). Siga fielmente o seu tom de voz e regras. Envie APENAS o texto da sua primeira mensagem para ele.` 
        }
      ]);
      if (aiResponse) message = aiResponse;
    } catch (e) {
      console.error("Erro ao gerar primeira mensagem via IA, usando fallback.", e);
    }

    const result = await sendWhatsAppMessage({
      to: lead.whatsapp,
      message,
      leadId,
    });
    await addEvent({
      leadId,
      channel: "WHATSAPP",
      direction: "SAIDA",
      content: result.ok
        ? message
        : `Falha ao enviar WhatsApp: ${result.error}`,
      scriptId: script?.id,
    });
    steps.push("whatsapp");
  }

  // 2) Instagram, se houver usuário
  if (lead.instagram) {
    const script = await getActiveScript(lead.mode, "INSTAGRAM");
    
    // Pede para a IA gerar a primeira mensagem
    let message = `Oi ${lead.name !== "Novo Contato" ? lead.name : ""}! Tudo bem?`;
    try {
      const { generateAgentResponse } = await import("@/lib/ai/responder");
      const systemPrompt = script?.content || "";
      const aiResponse = await generateAgentResponse(leadId, systemPrompt, [
        { 
          role: "user", 
          content: `(Instrução de sistema oculta) O lead acabou de entrar pelo Instagram. Inicie a conversa de forma proativa (outbound). Siga fielmente o seu tom de voz e regras. Envie APENAS o texto da sua primeira mensagem para ele.` 
        }
      ]);
      if (aiResponse) message = aiResponse;
    } catch (e) {
      console.error("Erro ao gerar primeira mensagem (Insta) via IA.", e);
    }

    const result = await sendInstagramMessage({
      to: lead.instagram,
      message,
      leadId,
    });
    await addEvent({
      leadId,
      channel: "INSTAGRAM",
      direction: "SAIDA",
      content: result.ok
        ? message
        : `Falha ao enviar Instagram: ${result.error}`,
      scriptId: script?.id,
    });
    steps.push("instagram");
  }

  // 3) Ligação com IA de voz — só no Modo 2
  if (lead.mode === "MODO_2" && (lead.phone || lead.whatsapp)) {
    const script = await getActiveScript(lead.mode, "LIGACAO");
    const result = await makeCall({
      to: lead.phone ?? lead.whatsapp!,
      leadId,
      script: script?.content ?? "",
    });
    await addEvent({
      leadId,
      channel: "LIGACAO",
      direction: "SAIDA",
      content: result.ok
        ? result.summary ?? "Ligação realizada."
        : `Falha na ligação: ${result.error}`,
    });
    steps.push("ligacao");
  }

  if (lead.status === "NOVO") {
    await updateLeadStatus(leadId, userId, "CONTATADO");
  }

  return { leadId, steps };
}

export async function runAutomationBatch(
  leadIds: string[],
  userId: string,
  concurrency = 5
) {
  const results: { leadId: string; steps: string[]; error?: string }[] = [];
  let index = 0;

  async function worker() {
    while (index < leadIds.length) {
      const id = leadIds[index++];
      try {
        const r = await runAutomationForLead(id, userId);
        results.push(r);
      } catch (e) {
        results.push({ leadId: id, steps: [], error: (e as Error).message });
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, leadIds.length) },
    worker
  );
  await Promise.all(workers);
  return results;
}

/**
 * Reenvia a mensagem de prospecção pra um lead que já foi contatado e não
 * respondeu — chamado pelo cron de follow-up (src/app/api/cron/follow-up),
 * nunca direto por um usuário. Só WhatsApp/Instagram (texto): ligar de novo
 * sozinho, sem gatilho humano, é mais invasivo do que vale a pena por
 * enquanto — fica de fora por decisão deliberada, não esquecimento.
 */
export async function runFollowUpForLead(leadId: string, userId: string) {
  const lead = await getLead(leadId, userId);
  if (!lead) throw new Error("Lead não encontrado");

  const steps: string[] = [];
  await addEvent({
    leadId,
    channel: "SISTEMA",
    direction: "SAIDA",
    content: "Follow-up automático disparado (sem resposta há alguns dias).",
  });

  if (lead.whatsapp) {
    const script = await getActiveScript(lead.mode, "WHATSAPP");
    let message = `Oi ${lead.name !== "Novo Contato" ? lead.name : ""}! Conseguimos conversar hoje?`;
    try {
      const { generateAgentResponse } = await import("@/lib/ai/responder");
      const systemPrompt = script?.content || "";
      const aiResponse = await generateAgentResponse(leadId, systemPrompt, [
        { 
          role: "user", 
          content: `(Instrução de sistema oculta) Faça um "follow-up" (retomada de contato) com o lead pois ele não responde há alguns dias. Seja super breve, natural, e puxe o interesse dele novamente usando as regras do seu tom de voz. Envie APENAS a mensagem.` 
        }
      ]);
      if (aiResponse) message = aiResponse;
    } catch (e) {
      console.error("Erro ao gerar follow-up via IA.", e);
    }

    const result = await sendWhatsAppMessage({ to: lead.whatsapp, message, leadId });
    await addEvent({
      leadId,
      channel: "WHATSAPP",
      direction: "SAIDA",
      content: result.ok ? message : `Falha ao enviar WhatsApp (follow-up): ${result.error}`,
      scriptId: script?.id,
    });
    steps.push("whatsapp");
  }

  if (lead.instagram) {
    const script = await getActiveScript(lead.mode, "INSTAGRAM");
    let message = `Oi ${lead.name !== "Novo Contato" ? lead.name : ""}! Conseguimos conversar hoje?`;
    try {
      const { generateAgentResponse } = await import("@/lib/ai/responder");
      const systemPrompt = script?.content || "";
      const aiResponse = await generateAgentResponse(leadId, systemPrompt, [
        { 
          role: "user", 
          content: `(Instrução de sistema oculta) Faça um "follow-up" (retomada de contato) pelo Instagram com o lead pois ele não responde há alguns dias. Seja super breve, natural e use seu tom de voz. Envie APENAS a mensagem.` 
        }
      ]);
      if (aiResponse) message = aiResponse;
    } catch (e) {
      console.error("Erro ao gerar follow-up (Insta) via IA.", e);
    }

    const result = await sendInstagramMessage({ to: lead.instagram, message, leadId });
    await addEvent({
      leadId,
      channel: "INSTAGRAM",
      direction: "SAIDA",
      content: result.ok ? message : `Falha ao enviar Instagram (follow-up): ${result.error}`,
      scriptId: script?.id,
    });
    steps.push("instagram");
  }

  return { leadId, steps };
}

/** Variáveis disponíveis no template de script, além de {{nome}}: {{origem}}
 * (source do lead, ou "seu contato" se não tiver) e {{telefone}} (WhatsApp
 * ou telefone, o que estiver preenchido). */
function renderScript(
  template: string | undefined,
  lead: Pick<Lead, "name" | "source" | "whatsapp" | "phone">
): string {
  const base =
    template ??
    "Oi {{nome}}! Aqui é da [Sua Empresa]. Podemos conversar 15 min essa semana?";
  return base
    .replaceAll("{{nome}}", lead.name)
    .replaceAll("{{origem}}", lead.source ?? "seu contato")
    .replaceAll("{{telefone}}", lead.whatsapp ?? lead.phone ?? "");
}
