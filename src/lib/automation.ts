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
  const lead = getLead(leadId, userId);
  if (!lead) throw new Error("Lead não encontrado");

  const steps: string[] = [];

  // 1) WhatsApp, se houver número
  if (lead.whatsapp) {
    const script = getActiveScript(lead.mode, "WHATSAPP");
    const message = renderScript(script?.content, lead);
    const result = await sendWhatsAppMessage({
      to: lead.whatsapp,
      message,
      leadId,
    });
    addEvent({
      leadId,
      channel: "WHATSAPP",
      direction: "SAIDA",
      content: result.ok
        ? message
        : `Falha ao enviar WhatsApp: ${result.error}`,
    });
    steps.push("whatsapp");
  }

  // 2) Instagram, se houver usuário
  if (lead.instagram) {
    const script = getActiveScript(lead.mode, "INSTAGRAM");
    const message = renderScript(script?.content, lead);
    const result = await sendInstagramMessage({
      to: lead.instagram,
      message,
      leadId,
    });
    addEvent({
      leadId,
      channel: "INSTAGRAM",
      direction: "SAIDA",
      content: result.ok
        ? message
        : `Falha ao enviar Instagram: ${result.error}`,
    });
    steps.push("instagram");
  }

  // 3) Ligação com IA de voz — só no Modo 2
  if (lead.mode === "MODO_2" && (lead.phone || lead.whatsapp)) {
    const script = getActiveScript(lead.mode, "LIGACAO");
    const result = await makeCall({
      to: lead.phone ?? lead.whatsapp!,
      leadId,
      script: script?.content ?? "",
    });
    addEvent({
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
    updateLeadStatus(leadId, userId, "CONTATADO");
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
