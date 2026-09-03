import Link from "next/link";
import { Users, CalendarClock, PhoneCall, TrendingUp, ArrowRight } from "lucide-react";
import {
  countLeadsByMode,
  countLeadsByStatus,
  listLeads,
} from "@/lib/repo/leads";
import { countUpcomingMeetings, listMeetings } from "@/lib/repo/meetings";
import { listRecentEvents } from "@/lib/repo/events";
import { ChannelBadge } from "@/components/Badges";
import { STATUS_LABELS, type LeadStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const FUNNEL_ORDER: LeadStatus[] = [
  "NOVO",
  "CONTATADO",
  "RESPONDENDO",
  "REUNIAO_AGENDADA",
  "FECHADO",
  "PERDIDO",
];

const FUNNEL_COLORS: Record<LeadStatus, string> = {
  NOVO: "bg-slate-400",
  CONTATADO: "bg-blue-500",
  RESPONDENDO: "bg-amber-500",
  REUNIAO_AGENDADA: "bg-violet-500",
  FECHADO: "bg-emerald-500",
  PERDIDO: "bg-rose-500",
};

export default function DashboardPage() {
  const totalLeads = listLeads().length;
  const byStatus = countLeadsByStatus();
  const byMode = countLeadsByMode();
  const upcomingMeetings = countUpcomingMeetings();
  const nextMeetings = listMeetings()
    .filter((m) => m.status === "AGENDADA")
    .slice(0, 5);
  const recentEvents = listRecentEvents(6);

  const maxCount = Math.max(1, ...FUNNEL_ORDER.map((s) => byStatus[s]));
  const conversionRate =
    totalLeads > 0 ? Math.round((byStatus.FECHADO / totalLeads) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          Visão geral da prospecção — o objetivo é fechar reuniões.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          iconClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
          label="Leads no total"
          value={totalLeads}
        />
        <StatCard
          icon={CalendarClock}
          iconClass="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
          label="Reuniões agendadas"
          value={upcomingMeetings}
        />
        <StatCard
          icon={PhoneCall}
          iconClass="bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
          label="Modo 2 (com ligação)"
          value={byMode.MODO_2}
          hint={`${byMode.MODO_1} no Modo 1`}
        />
        <StatCard
          icon={TrendingUp}
          iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
          label="Taxa de conversão"
          value={`${conversionRate}%`}
          hint={`${byStatus.FECHADO} fechado(s)`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="card p-6 xl:col-span-2">
          <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
            Funil de status
          </h2>
          <ul className="mt-5 space-y-4">
            {FUNNEL_ORDER.map((status) => {
              const count = byStatus[status];
              const pct = Math.round((count / maxCount) * 100);
              const share = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
              return (
                <li key={status}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      {STATUS_LABELS[status]}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {count}
                      </span>
                      {" · "}
                      {share}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-2.5 rounded-full transition-[width] duration-500 ${FUNNEL_COLORS[status]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex flex-col gap-6">
          <div className="card p-6">
            <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
              Próximas reuniões
            </h2>
            <ul className="mt-5 space-y-1">
              {nextMeetings.length === 0 && (
                <li className="text-sm text-slate-400 dark:text-slate-500">
                  Nenhuma reunião agendada ainda.
                </li>
              )}
              {nextMeetings.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/leads/${m.leadId}`}
                    className="group -mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-50 text-xs font-semibold text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
                        {initials(m.leadName)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">
                          {m.leadName}
                        </span>
                        <span className="block text-xs text-slate-500 dark:text-slate-400">
                          {new Date(m.scheduledAt).toLocaleString("pt-BR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                      </span>
                    </div>
                    <ArrowRight
                      size={15}
                      className="shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500 dark:text-slate-600 dark:group-hover:text-slate-400"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="card flex-1 p-6">
            <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
              Atividade recente
            </h2>
            <ul className="mt-5 space-y-4">
              {recentEvents.length === 0 && (
                <li className="text-sm text-slate-400 dark:text-slate-500">
                  Nenhuma atividade ainda.
                </li>
              )}
              {recentEvents.map((ev) => (
                <li key={ev.id}>
                  <Link
                    href={`/leads/${ev.leadId}`}
                    className="block rounded-lg transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 -mx-2 px-2 py-1"
                  >
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="font-medium text-slate-900 dark:text-white">
                        {ev.leadName}
                      </span>
                      <ChannelBadge channel={ev.channel} />
                      <span className="text-slate-400 dark:text-slate-500">
                        {new Date(ev.createdAt).toLocaleString("pt-BR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm text-slate-600 dark:text-slate-400">
                      {ev.content}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function StatCard({
  icon: Icon,
  iconClass,
  label,
  value,
  hint,
}: {
  icon: typeof Users;
  iconClass: string;
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="card p-5">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClass}`}>
        <Icon size={18} strokeWidth={2.25} />
      </div>
      <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  );
}
