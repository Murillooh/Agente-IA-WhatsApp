import Link from "next/link";
import { Users, CalendarClock, PhoneCall } from "lucide-react";
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
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Visão geral da prospecção — o objetivo é fechar reuniões.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Users} label="Leads no total" value={totalLeads} />
        <StatCard
          icon={CalendarClock}
          label="Reuniões agendadas"
          value={upcomingMeetings}
        />
        <StatCard
          icon={PhoneCall}
          label="Modo 2 (com ligação)"
          value={byMode.MODO_2}
          hint={`${byMode.MODO_1} no Modo 1`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">
            Funil de status
          </h2>
          <ul className="mt-4 space-y-3">
            {FUNNEL_ORDER.map((status) => {
              const count = byStatus[status];
              const pct = Math.round((count / maxCount) * 100);
              return (
                <li key={status}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">
                      {STATUS_LABELS[status]}
                    </span>
                    <span className="font-medium text-slate-900">
                      {count}
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-slate-900"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">
            Próximas reuniões
          </h2>
          <ul className="mt-4 space-y-4">
            {nextMeetings.length === 0 && (
              <li className="text-sm text-slate-400">
                Nenhuma reunião agendada ainda.
              </li>
            )}
            {nextMeetings.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/leads/${m.leadId}`}
                  className="font-medium text-slate-900 hover:underline"
                >
                  {m.leadName}
                </Link>
                <p className="text-xs text-slate-500">
                  {new Date(m.scheduledAt).toLocaleString("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon size={16} />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
