import clsx from "clsx";
import {
  CHANNEL_LABELS,
  MODE_LABELS,
  STATUS_LABELS,
  type Channel,
  type LeadStatus,
  type Mode,
} from "@/lib/types";

const statusStyles: Record<LeadStatus, string> = {
  NOVO: "bg-slate-100 text-slate-700",
  CONTATADO: "bg-blue-100 text-blue-700",
  RESPONDENDO: "bg-amber-100 text-amber-700",
  REUNIAO_AGENDADA: "bg-violet-100 text-violet-700",
  FECHADO: "bg-emerald-100 text-emerald-700",
  PERDIDO: "bg-rose-100 text-rose-700",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        statusStyles[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function ModeBadge({ mode }: { mode: Mode }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        mode === "MODO_2"
          ? "bg-orange-100 text-orange-700"
          : "bg-teal-100 text-teal-700"
      )}
    >
      {MODE_LABELS[mode]}
    </span>
  );
}

export function ChannelBadge({ channel }: { channel: Channel }) {
  const styles: Record<Channel, string> = {
    WHATSAPP: "bg-green-100 text-green-700",
    INSTAGRAM: "bg-pink-100 text-pink-700",
    LIGACAO: "bg-indigo-100 text-indigo-700",
    SISTEMA: "bg-slate-100 text-slate-500",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
        styles[channel]
      )}
    >
      {CHANNEL_LABELS[channel]}
    </span>
  );
}
