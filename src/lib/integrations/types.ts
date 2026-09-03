// Tipos comuns para qualquer provedor que você conectar depois
// (WhatsApp Business API / Meta, Instagram Graph API, e a API de
// IA de voz que você escolher: Vapi, Bland, Retell, Twilio+LLM, etc.)

export interface SendMessageInput {
  to: string; // telefone (WhatsApp) ou @usuario (Instagram)
  message: string;
  leadId: string;
}

export interface SendMessageResult {
  ok: boolean;
  providerMessageId?: string;
  error?: string;
}

export interface MakeCallInput {
  to: string; // telefone em formato internacional
  leadId: string;
  script: string; // roteiro/instruções para a IA de voz seguir na ligação
}

export interface MakeCallResult {
  ok: boolean;
  providerCallId?: string;
  summary?: string; // resumo da ligação (o "esboço") devolvido pelo provedor
  error?: string;
}
