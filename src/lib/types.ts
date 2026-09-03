export type Mode = "MODO_1" | "MODO_2";

export type LeadStatus =
  | "NOVO"
  | "CONTATADO"
  | "RESPONDENDO"
  | "REUNIAO_AGENDADA"
  | "FECHADO"
  | "PERDIDO";

export type Channel = "WHATSAPP" | "INSTAGRAM" | "LIGACAO" | "SISTEMA";

export type Direction = "SAIDA" | "ENTRADA";

export type MeetingStatus = "AGENDADA" | "REALIZADA" | "CANCELADA";

export interface Lead {
  id: string;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  source: string | null;
  mode: Mode;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationEvent {
  id: string;
  leadId: string;
  channel: Channel;
  direction: Direction;
  content: string;
  createdAt: string;
}

export interface Meeting {
  id: string;
  leadId: string;
  scheduledAt: string;
  status: MeetingStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SalesScript {
  id: string;
  name: string;
  mode: Mode;
  channel: Channel;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const MODE_LABELS: Record<Mode, string> = {
  MODO_1: "Modo 1 · WhatsApp/Instagram",
  MODO_2: "Modo 2 · WhatsApp/Instagram + Ligação",
};

export const STATUS_LABELS: Record<LeadStatus, string> = {
  NOVO: "Novo",
  CONTATADO: "Contatado",
  RESPONDENDO: "Respondendo",
  REUNIAO_AGENDADA: "Reunião agendada",
  FECHADO: "Fechado",
  PERDIDO: "Perdido",
};

export const CHANNEL_LABELS: Record<Channel, string> = {
  WHATSAPP: "WhatsApp",
  INSTAGRAM: "Instagram",
  LIGACAO: "Ligação",
  SISTEMA: "Sistema",
};
