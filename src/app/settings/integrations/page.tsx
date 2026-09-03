import { CheckCircle2, CircleDashed } from "lucide-react";

export const dynamic = "force-dynamic";

const integrations = [
  {
    key: "WHATSAPP_API_TOKEN",
    name: "WhatsApp",
    description:
      "Usado para enviar as mensagens de prospecção do Modo 1 e 2. Implemente em src/lib/integrations/whatsapp.ts.",
    envVars: ["WHATSAPP_API_TOKEN", "WHATSAPP_PHONE_NUMBER_ID"],
    suggestions: "Meta Cloud API, Twilio WhatsApp, Z-API",
  },
  {
    key: "INSTAGRAM_API_TOKEN",
    name: "Instagram",
    description:
      "Usado para enviar DMs de prospecção do Modo 1 e 2. Implemente em src/lib/integrations/instagram.ts.",
    envVars: ["INSTAGRAM_API_TOKEN", "INSTAGRAM_BUSINESS_ACCOUNT_ID"],
    suggestions: "Instagram Graph API (Meta)",
  },
  {
    key: "VOICE_AI_API_KEY",
    name: "IA de voz / Ligações",
    description:
      "Usado no Modo 2 para fazer as ligações automáticas (inclusive várias ao mesmo tempo). Implemente em src/lib/integrations/voice.ts.",
    envVars: ["VOICE_AI_PROVIDER", "VOICE_AI_API_KEY", "VOICE_AI_AGENT_ID"],
    suggestions: "Vapi, Bland AI, Retell AI, Twilio + LLM",
  },
];

export default function IntegrationsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Integrações</h1>
        <p className="mt-1 text-sm text-slate-500">
          Hoje o sistema roda em modo simulado (sem chamar nenhuma API externa). Quando
          você pesquisar e escolher os provedores, configure as variáveis de ambiente
          abaixo (arquivo <code>.env</code>) e implemente a chamada real no arquivo
          indicado — o restante do app (leads, timeline, reuniões) já funciona sem
          mudar mais nada.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {integrations.map((i) => {
          const connected = Boolean(process.env[i.key]);
          return (
            <div key={i.key} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">{i.name}</p>
                {connected ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <CheckCircle2 size={14} /> Conectado
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
                    <CircleDashed size={14} /> Não conectado
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-slate-500">{i.description}</p>
              <div className="mt-3 space-y-1">
                {i.envVars.map((v) => (
                  <code
                    key={v}
                    className="block rounded bg-slate-50 px-2 py-1 text-[11px] text-slate-500"
                  >
                    {v}
                  </code>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-slate-400">
                Provedores comuns: {i.suggestions}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
