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
  NOVO: "bg-slate-50 text-slate-700 ring-slate-600/15 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-400/20",
  CONTATADO: "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/30",
  RESPONDENDO: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30",
  REUNIAO_AGENDADA: "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-500/30",
  FECHADO: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30",
  PERDIDO: "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/30",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
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
        "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        mode === "MODO_2"
          ? "bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/30"
          : "bg-teal-50 text-teal-700 ring-teal-600/20 dark:bg-teal-500/10 dark:text-teal-400 dark:ring-teal-500/30"
      )}
    >
      {MODE_LABELS[mode]}
    </span>
  );
}

export function ChannelBadge({ channel }: { channel: Channel }) {
  const styles: Record<Channel, string> = {
    WHATSAPP: "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/30",
    INSTAGRAM: "bg-pink-50 text-pink-700 ring-pink-600/20 dark:bg-pink-500/10 dark:text-pink-400 dark:ring-pink-500/30",
    LIGACAO: "bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-400 dark:ring-indigo-500/30",
    SISTEMA: "bg-slate-50 text-slate-500 ring-slate-600/15 dark:bg-slate-500/10 dark:text-slate-400 dark:ring-slate-400/20",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        styles[channel]
      )}
    >
      {CHANNEL_LABELS[channel]}
    </span>
  );
}
