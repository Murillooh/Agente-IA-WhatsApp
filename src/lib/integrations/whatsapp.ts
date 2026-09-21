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
  const instanceId = process.env.ZAPI_INSTANCE_ID;
  const token = process.env.ZAPI_TOKEN;
  const clientToken = process.env.ZAPI_CLIENT_TOKEN; // Usualmente passado por header se requerido

  if (!instanceId || !token) {
    console.warn("⚠️ ZAPI_INSTANCE_ID ou ZAPI_TOKEN não configurados. Usando mock.");
    await new Promise((r) => setTimeout(r, 150));
    return {
      ok: true,
      providerMessageId: `mock_wa_${Date.now()}`,
    };
  }

  try {
    const res = await fetch(
      `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(clientToken ? { "Client-Token": clientToken } : {})
        },
        body: JSON.stringify({
          phone: input.to, // O Z-API espera o número em formato DDI+DDD+NUM sem símbolos, ex: 5511999999999
          message: input.message,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok || (data.hasOwnProperty('error') && data.error !== null)) {
      console.error("Erro na API do Z-API:", data);
      return {
        ok: false,
        error: data.error || data.message || "Erro desconhecido ao enviar mensagem.",
      };
    }

    return {
      ok: true,
      providerMessageId: data.messageId || `wa_${Date.now()}`,
    };
  } catch (error: any) {
    console.error("Falha ao comunicar com Z-API:", error);
    return { ok: false, error: error.message };
  }
}
