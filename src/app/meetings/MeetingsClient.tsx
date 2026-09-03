"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, CalendarClock } from "lucide-react";
import type { Meeting } from "@/lib/types";

type MeetingRow = Meeting & { leadName: string };

const statusStyles: Record<string, string> = {
  AGENDADA: "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-500/30",
  REALIZADA: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30",
  CANCELADA: "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/30",
};

export function MeetingsClient({ meetings }: { meetings: MeetingRow[] }) {
  const router = useRouter();

  async function updateStatus(leadId: string, status: "REALIZADA" | "CANCELADA") {
    await fetch(`/api/leads/${leadId}/meeting`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Reuniões
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          Todas as reuniões agendadas pela prospecção — o objetivo final do sistema.
        </p>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-400 dark:border-slate-800 dark:text-slate-500">
            <tr>
              <th className="px-4 py-3">Lead</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Notas</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {meetings.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-300 dark:bg-slate-800 dark:text-slate-600">
                      <CalendarClock size={20} />
                    </span>
                    <p className="text-sm text-slate-400 dark:text-slate-500">
                      Nenhuma reunião agendada ainda.
                    </p>
                  </div>
                </td>
              </tr>
            )}
            {meetings.map((m) => (
              <tr
                key={m.id}
                className="border-b border-slate-50 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800/60 dark:hover:bg-slate-800/50"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/leads/${m.leadId}`}
                    className="font-medium text-slate-900 hover:text-indigo-600 hover:underline dark:text-white dark:hover:text-indigo-400"
                  >
                    {m.leadName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  {new Date(m.scheduledAt).toLocaleString("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[m.status]}`}
                  >
                    {m.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{m.notes || "—"}</td>
                <td className="px-4 py-3">
                  {m.status === "AGENDADA" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(m.leadId, "REALIZADA")}
                        title="Marcar como realizada"
                        className="text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                      <button
                        onClick={() => updateStatus(m.leadId, "CANCELADA")}
                        title="Cancelar"
                        className="text-slate-400 transition-colors hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
