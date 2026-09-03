import type { SendMessageInput, SendMessageResult } from "./types";

/**
 * Envia uma mensagem direta (DM) no Instagram para o lead.
 *
 * HOJE: modo simulado (mock).
 *
 * QUANDO VOCÊ ESCOLHER O PROVEDOR (ex: Instagram Graph API / Meta),
 * substitua o corpo desta função. Sugestão de variáveis de ambiente:
 *   INSTAGRAM_API_TOKEN
 *   INSTAGRAM_BUSINESS_ACCOUNT_ID
 */
export async function sendInstagramMessage(
  input: SendMessageInput
): Promise<SendMessageResult> {
  const configured = Boolean(process.env.INSTAGRAM_API_TOKEN);

  if (!configured) {
    await new Promise((r) => setTimeout(r, 150));
    return {
      ok: true,
      providerMessageId: `mock_ig_${Date.now()}`,
    };
  }

  // TODO: implementar chamada real quando INSTAGRAM_API_TOKEN estiver configurado.
  void input;
  return { ok: false, error: "Integração real do Instagram ainda não implementada." };
}
