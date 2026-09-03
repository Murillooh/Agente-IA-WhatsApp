import { getLead, updateLeadStatus } from "@/lib/repo/leads";
import { addEvent } from "@/lib/repo/events";
import { getActiveScript } from "@/lib/repo/scripts";
import { sendWhatsAppMessage } from "@/lib/integrations/whatsapp";
import { sendInstagramMessage } from "@/lib/integrations/instagram";
import { makeCall } from "@/lib/integrations/voice";

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
export async function runAutomationForLead(leadId: string) {
  const lead = getLead(leadId);
  if (!lead) throw new Error("Lead não encontrado");

  const steps: string[] = [];

  // 1) WhatsApp, se houver número
  if (lead.whatsapp) {
    const script = getActiveScript(lead.mode, "WHATSAPP");
    const message = renderScript(script?.content, lead.name);
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
    const message = renderScript(script?.content, lead.name);
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
    updateLeadStatus(leadId, "CONTATADO");
  }

  return { leadId, steps };
}

export async function runAutomationBatch(leadIds: string[], concurrency = 5) {
  const results: { leadId: string; steps: string[]; error?: string }[] = [];
  let index = 0;

  async function worker() {
    while (index < leadIds.length) {
      const id = leadIds[index++];
      try {
        const r = await runAutomationForLead(id);
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

function renderScript(template: string | undefined, name: string): string {
  const base =
    template ??
    "Oi {{nome}}! Aqui é da [Sua Empresa]. Podemos conversar 15 min essa semana?";
  return base.replaceAll("{{nome}}", name);
}
