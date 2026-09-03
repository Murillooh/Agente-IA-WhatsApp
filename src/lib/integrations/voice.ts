import type { MakeCallInput, MakeCallResult } from "./types";

/**
 * Dispara UMA ligação com IA de voz para o lead, seguindo o roteiro (script).
 *
 * HOJE: modo simulado (mock) — devolve um resumo fictício da ligação
 * para o restante do sistema (timeline do lead, status, etc.) já
 * funcionar de ponta a ponta.
 *
 * QUANDO VOCÊ ESCOLHER O PROVEDOR de IA de voz/ligação (ex: Vapi, Bland AI,
 * Retell AI, Twilio + um LLM, etc.), substitua o corpo desta função pela
 * chamada real à API escolhida. Sugestão de variáveis de ambiente:
 *   VOICE_AI_PROVIDER      (ex: "vapi" | "bland" | "retell")
 *   VOICE_AI_API_KEY
 *   VOICE_AI_AGENT_ID      (se o provedor usar um "assistente" pré-configurado)
 *
 * A maioria desses provedores funciona de forma assíncrona: você inicia a
 * ligação por uma chamada HTTP e recebe o resultado/transcrição depois, via
 * webhook. Se for esse o caso, crie uma rota de API (ex:
 * src/app/api/webhooks/voice/route.ts) que recebe o callback do provedor e
 * chama addEvent(...) + updateLeadStatus(...) para atualizar o lead quando a
 * ligação terminar, em vez de esperar a resposta aqui.
 */
export async function makeCall(input: MakeCallInput): Promise<MakeCallResult> {
  const configured = Boolean(process.env.VOICE_AI_API_KEY);

  if (!configured) {
    // Modo simulado: nenhuma API de voz real foi conectada ainda.
    await new Promise((r) => setTimeout(r, 400));
    return {
      ok: true,
      providerCallId: `mock_call_${Date.now()}`,
      summary:
        "Ligação simulada. Quando você conectar a API de voz real, este campo trará o resumo/transcrição gerado pelo provedor.",
    };
  }

  // TODO: implementar chamada real ao provedor escolhido quando
  // VOICE_AI_API_KEY estiver configurado.
  void input;
  return { ok: false, error: "Integração real de voz ainda não implementada." };
}

/**
 * Dispara VÁRIAS ligações em paralelo (uma IA "ligando para várias pessoas
 * ao mesmo tempo"), respeitando um limite de concorrência — importante
 * porque a maioria dos provedores de voz tem um número máximo de
 * chamadas simultâneas por conta.
 */
export async function makeCallsBatch(
  calls: MakeCallInput[],
  concurrency = 5
): Promise<Map<string, MakeCallResult>> {
  const results = new Map<string, MakeCallResult>();
  let index = 0;

  async function worker() {
    while (index < calls.length) {
      const current = calls[index++];
      const result = await makeCall(current);
      results.set(current.leadId, result);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, calls.length) }, worker);
  await Promise.all(workers);
  return results;
}
