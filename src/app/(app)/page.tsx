import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, CalendarClock, PhoneCall, TrendingUp, ArrowRight, Timer, Activity } from "lucide-react";
import {
  averageDaysToClose,
  conversionBySource,
  countLeadsByMode,
  countLeadsByStatus,
  listLeads,
  type DateRange,
} from "@/lib/repo/leads";
import { countUpcomingMeetings, listMeetings } from "@/lib/repo/meetings";
import { listRecentEvents } from "@/lib/repo/events";
import { getSession } from "@/lib/auth/session";
import { ChannelBadge } from "@/components/Badges";
import { PeriodFilter } from "@/components/PeriodFilter";
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
  NOVO: "bg-slate-300 dark:bg-slate-600",
  CONTATADO: "bg-blue-400 dark:bg-blue-600",
  RESPONDENDO: "bg-amber-400 dark:bg-amber-600",
  REUNIAO_AGENDADA: "bg-gradient-to-r from-violet-500 to-fuchsia-500",
  FECHADO: "bg-gradient-to-r from-emerald-400 to-emerald-600",
  PERDIDO: "bg-rose-500 dark:bg-rose-600",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const userId = session.userId;

  const { from, to } = await searchParams;
  const range: DateRange = {
    from: from ? `${from}T00:00:00.000Z` : undefined,
    to: to ? `${to}T23:59:59.999Z` : undefined,
  };
  const periodActive = Boolean(range.from || range.to);

  const leads = await listLeads(userId, range);
  const totalLeads = leads.length;
  const byStatus = await countLeadsByStatus(userId, range);
  const byMode = await countLeadsByMode(userId, range);
  const upcomingMeetings = await countUpcomingMeetings(userId);
  const meetings = await listMeetings(userId);
  const nextMeetings = meetings
    .filter((m) => m.status === "AGENDADA")
    .slice(0, 5);
  const recentEvents = await listRecentEvents(userId, 6);
  const avgDays = await averageDaysToClose(userId, range);
  const bySource = await conversionBySource(userId, range);

  const maxCount = Math.max(1, ...FUNNEL_ORDER.map((s) => byStatus[s]));
  const conversionRate =
    totalLeads > 0 ? Math.round((byStatus.FECHADO / totalLeads) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* Header Premium */}
      <div className="relative flex flex-col gap-6 overflow-hidden rounded-[2rem] bg-slate-900 p-8 shadow-2xl sm:flex-row sm:items-end sm:justify-between dark:border dark:border-white/10 dark:bg-[#0b1220]">
        <div className="absolute inset-0 opacity-[0.15] dark:opacity-[0.05]" style={{ backgroundImage: "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent dark:from-[#0b1220]" />
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />
        
        <div className="relative z-10">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-indigo-300 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
            </span>
            Overview em Tempo Real
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl drop-shadow-sm">
            Dashboard
          </h1>
          <p className="mt-2 max-w-xl text-sm font-medium text-slate-300">
            {periodActive
              ? "Visão da prospecção no período selecionado."
              : "Visão geral da prospecção — o objetivo é fechar reuniões e gerar receita."}
          </p>
        </div>
        <div className="relative z-10 w-full sm:w-auto">
          <PeriodFilter />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          iconClass="text-indigo-600 dark:text-indigo-400"
          bgHover="group-hover:from-indigo-500/5 dark:group-hover:from-indigo-500/10"
          label="Leads no total"
          value={totalLeads}
        />
        <StatCard
          icon={CalendarClock}
          iconClass="text-violet-600 dark:text-violet-400"
          bgHover="group-hover:from-violet-500/5 dark:group-hover:from-violet-500/10"
          label="Reuniões agendadas"
          value={upcomingMeetings}
        />
        <StatCard
          icon={PhoneCall}
          iconClass="text-orange-600 dark:text-orange-400"
          bgHover="group-hover:from-orange-500/5 dark:group-hover:from-orange-500/10"
          label="Modo 2 (Com Ligação)"
          value={byMode.MODO_2}
          hint={`${byMode.MODO_1} no Modo 1`}
        />
        <StatCard
          icon={TrendingUp}
          iconClass="text-emerald-600 dark:text-emerald-400"
          bgHover="group-hover:from-emerald-500/5 dark:group-hover:from-emerald-500/10"
          label="Taxa de conversão"
          value={`${conversionRate}%`}
          hint={`${byStatus.FECHADO} fechado(s)`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Coluna Esquerda */}
        <div className="flex flex-col gap-6 xl:col-span-2">
          
          {/* Funil de status */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-white/[0.06] dark:bg-[#0c121e]">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">
                Funil de Conversão
              </h2>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                {totalLeads} LEADS
              </div>
            </div>
            
            <div className="space-y-5">
              {FUNNEL_ORDER.map((status) => {
                const count = byStatus[status];
                const pct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
                const share = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
                
                return (
                  <div key={status} className="group relative">
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        {STATUS_LABELS[status]}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-base font-black text-slate-900 dark:text-white">
                          {count}
                        </span>
                        <span className="w-10 text-right text-[10px] font-bold text-slate-400">
                          {share}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800/60 shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${FUNNEL_COLORS[status]}`}
                        style={{ width: `${pct}%`, opacity: count === 0 ? 0.2 : 1 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conversão por origem */}
          <div className="relative flex flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-white/[0.06] dark:bg-[#0c121e]">
            <h2 className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">
              Conversão por origem
            </h2>
            {bySource.length === 0 ? (
              <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 dark:border-white/5 dark:bg-white/[0.02]">
                <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
                  Nenhum lead {periodActive ? "no período" : "ainda"}.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:border-slate-800/80 dark:text-slate-500">
                    <tr>
                      <th className="pb-3 pr-3">Origem</th>
                      <th className="pb-3 pr-3 text-right">Leads</th>
                      <th className="pb-3 pr-3 text-right">Fechados</th>
                      <th className="pb-3 text-right">Conversão</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {bySource.map((s) => {
                      const rate = s.total > 0 ? Math.round((s.closed / s.total) * 100) : 0;
                      return (
                        <tr
                          key={s.source}
                          className="group transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
                        >
                          <td className="py-3.5 pr-3 font-semibold text-slate-700 dark:text-slate-300">
                            {s.source}
                          </td>
                          <td className="py-3.5 pr-3 text-right font-medium text-slate-500 dark:text-slate-400">
                            {s.total}
                          </td>
                          <td className="py-3.5 pr-3 text-right font-medium text-slate-500 dark:text-slate-400">
                            {s.closed}
                          </td>
                          <td className="py-3.5 text-right font-black text-slate-900 dark:text-white">
                            {rate}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Coluna Direita */}
        <div className="flex flex-col gap-6">
          
          {/* Próximas reuniões */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-white/[0.06] dark:bg-[#0c121e]">
            <h2 className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">
              Próximas reuniões
            </h2>
            <ul className="space-y-3">
              {nextMeetings.length === 0 && (
                <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 dark:border-white/5 dark:bg-white/[0.02]">
                  <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
                    Nenhuma reunião agendada ainda.
                  </p>
                </div>
              )}
              {nextMeetings.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/leads/${m.leadId}`}
                    className="group flex items-center justify-between gap-3 rounded-2xl border border-transparent bg-slate-50 p-3 transition-all hover:border-slate-200 hover:bg-white hover:shadow-sm dark:bg-slate-800/40 dark:hover:border-white/10 dark:hover:bg-slate-800"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-bold tracking-wider text-white shadow-inner">
                        {initials(m.leadName)}
                      </div>
                      <div className="min-w-0">
                        <span className="block truncate text-sm font-bold text-slate-900 dark:text-white">
                          {m.leadName}
                        </span>
                        <span className="block text-xs font-semibold text-violet-600 dark:text-violet-400">
                          {new Date(m.scheduledAt).toLocaleString("pt-BR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm transition-transform group-hover:scale-110 group-hover:text-slate-600 dark:bg-slate-900 dark:text-slate-500 dark:group-hover:text-slate-300">
                      <ArrowRight size={14} strokeWidth={2.5} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Atividade recente */}
          <div className="relative flex flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-white/[0.06] dark:bg-[#0c121e]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white">
                Atividade recente
              </h2>
              <Activity size={16} className="text-slate-400" />
            </div>
            
            <div className="relative pl-3 flex-1">
              {recentEvents.length > 0 && (
                <div className="absolute bottom-0 left-[11px] top-2 w-[2px] bg-slate-100 dark:bg-slate-800" />
              )}
              <ul className="space-y-5">
                {recentEvents.length === 0 && (
                  <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 dark:border-white/5 dark:bg-white/[0.02]">
                    <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
                      Nenhuma atividade ainda.
                    </p>
                  </div>
                )}
                {recentEvents.map((ev) => (
                  <li key={ev.id} className="relative">
                    <div className="absolute -left-[27px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-slate-300 dark:border-[#0c121e] dark:bg-slate-600" />
                    <Link
                      href={`/leads/${ev.leadId}`}
                      className="group block rounded-2xl border border-transparent p-3 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/40 -mt-3"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {ev.leadName}
                        </span>
                        <ChannelBadge channel={ev.channel} />
                        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                          {new Date(ev.createdAt).toLocaleString("pt-BR", {
                            hour: '2-digit', minute:'2-digit'
                          })}
                        </span>
                      </div>
                      <p className="mt-1.5 truncate text-sm font-medium text-slate-500 transition-colors group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-300">
                        {ev.content}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tempo médio até fechar */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-white/[0.06] dark:bg-[#0c121e]">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-sky-500/10 blur-2xl" />
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg shadow-sky-500/20`}>
              <Timer size={24} strokeWidth={2.5} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Tempo médio até fechar
            </p>
            <p className="mt-1 text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {avgDays === null ? "—" : `${avgDays.toFixed(1)} d`}
            </p>
            <p className="mt-2 text-xs font-medium text-slate-400 dark:text-slate-500">
              {avgDays === null
                ? "Nenhum lead fechado ainda."
                : "Da criação do lead até o fechamento."}
            </p>
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
  bgHover,
  label,
  value,
  hint,
}: {
  icon: typeof Users;
  iconClass: string;
  bgHover: string;
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-white/[0.06] dark:bg-[#0c121e] dark:hover:border-white/[0.12]">
      <div className={`absolute -inset-px rounded-3xl bg-gradient-to-b to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${bgHover} from-slate-100`} />
      
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{label}</p>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl border border-black/5 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] shadow-inner ${iconClass}`}>
            <Icon size={18} strokeWidth={2.5} />
          </div>
        </div>
        
        <div>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {value}
            </p>
          </div>
          <p className="mt-1 min-h-[16px] text-xs font-medium text-slate-400 dark:text-slate-500">
            {hint || ""}
          </p>
        </div>
      </div>
    </div>
  );
}
