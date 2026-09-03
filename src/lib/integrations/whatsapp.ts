import type { SendMessageInput, SendMessageResult } from "./types";

/**
 * Envia uma mensagem de WhatsApp para o lead.
 *
 * HOJE: modo simulado (mock) — não chama nenhuma API externa, só
 * devolve sucesso para o fluxo de automação funcionar de ponta a ponta.
 *
 * QUANDO VOCÊ ESCOLHER O PROVEDOR (ex: WhatsApp Business API / Meta Cloud API,
 * Twilio WhatsApp, Z-API, etc.), substitua o corpo desta função pela chamada
 * real. Sugestão de variáveis de ambiente:
 *   WHATSAPP_API_TOKEN
 *   WHATSAPP_PHONE_NUMBER_ID
 *
 * Exemplo (Meta Cloud API), só como referência:
 *
 * const res = await fetch(
 *   `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
 *   {
 *     method: "POST",
 *     headers: {
 *       Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
 *       "Content-Type": "application/json",
 *     },
 *     body: JSON.stringify({
 *       messaging_product: "whatsapp",
 *       to: input.to,
 *       type: "text",
 *       text: { body: input.message },
 *     }),
 *   }
 * );
 */
export async function sendWhatsAppMessage(
  input: SendMessageInput
): Promise<SendMessageResult> {
  const configured = Boolean(process.env.WHATSAPP_API_TOKEN);

  if (!configured) {
    // Modo simulado: nenhuma API real foi conectada ainda.
    await new Promise((r) => setTimeout(r, 150));
    return {
      ok: true,
      providerMessageId: `mock_wa_${Date.now()}`,
    };
  }

  // TODO: implementar chamada real quando WHATSAPP_API_TOKEN estiver configurado,
  // usando os dados de `input` (destinatário e mensagem) montados acima.
  void input;
  return { ok: false, error: "Integração real do WhatsApp ainda não implementada." };
}
