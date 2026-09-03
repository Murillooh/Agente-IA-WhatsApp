import Link from "next/link";
import { Users, CalendarClock, PhoneCall, ArrowRight } from "lucide-react";
import {
  countLeadsByMode,
  countLeadsByStatus,
  listLeads,
} from "@/lib/repo/leads";
import { countUpcomingMeetings, listMeetings } from "@/lib/repo/meetings";
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

  const maxCount = Math.max(1, ...FUNNEL_ORDER.map((s) => byStatus[s]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Visão geral da prospecção — o objetivo é fechar reuniões.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={Users}
          iconClass="bg-indigo-50 text-indigo-600"
          label="Leads no total"
          value={totalLeads}
        />
        <StatCard
          icon={CalendarClock}
          iconClass="bg-violet-50 text-violet-600"
          label="Reuniões agendadas"
          value={upcomingMeetings}
        />
        <StatCard
          icon={PhoneCall}
          iconClass="bg-orange-50 text-orange-600"
          label="Modo 2 (com ligação)"
          value={byMode.MODO_2}
          hint={`${byMode.MODO_1} no Modo 1`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold tracking-tight text-slate-900">
            Funil de status
          </h2>
          <ul className="mt-5 space-y-4">
            {FUNNEL_ORDER.map((status) => {
              const count = byStatus[status];
              const pct = Math.round((count / maxCount) * 100);
              return (
                <li key={status}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                      {STATUS_LABELS[status]}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {count}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-slate-100">
                    <div
                      className={`h-2 rounded-full transition-[width] duration-500 ${FUNNEL_COLORS[status]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="card p-6">
          <h2 className="text-sm font-semibold tracking-tight text-slate-900">
            Próximas reuniões
          </h2>
          <ul className="mt-5 space-y-1">
            {nextMeetings.length === 0 && (
              <li className="text-sm text-slate-400">
                Nenhuma reunião agendada ainda.
              </li>
            )}
            {nextMeetings.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/leads/${m.leadId}`}
                  className="group -mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-50 text-xs font-semibold text-violet-600">
                      {initials(m.leadName)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-900">
                        {m.leadName}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {new Date(m.scheduledAt).toLocaleString("pt-BR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                    </span>
                  </div>
                  <ArrowRight
                    size={15}
                    className="shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500"
                  />
                </Link>
              </li>
            ))}
          </ul>
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
  value: number;
  hint?: string;
}) {
  return (
    <div className="card p-5">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClass}`}>
        <Icon size={18} strokeWidth={2.25} />
      </div>
      <p className="mt-3 text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
