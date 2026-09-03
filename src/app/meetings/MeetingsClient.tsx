"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import type { Meeting } from "@/lib/types";

type MeetingRow = Meeting & { leadName: string };

const statusStyles: Record<string, string> = {
  AGENDADA: "bg-violet-100 text-violet-700",
  REALIZADA: "bg-emerald-100 text-emerald-700",
  CANCELADA: "bg-rose-100 text-rose-700",
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
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Reuniões</h1>
        <p className="mt-1 text-sm text-slate-500">
          Todas as reuniões agendadas pela prospecção — o objetivo final do sistema.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 text-xs text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Lead</th>
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Notas</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {meetings.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Nenhuma reunião agendada ainda.
                </td>
              </tr>
            )}
            {meetings.map((m) => (
              <tr key={m.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/leads/${m.leadId}`} className="font-medium text-slate-900 hover:underline">
                    {m.leadName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {new Date(m.scheduledAt).toLocaleString("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[m.status]}`}
                  >
                    {m.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{m.notes || "—"}</td>
                <td className="px-4 py-3">
                  {m.status === "AGENDADA" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(m.leadId, "REALIZADA")}
                        title="Marcar como realizada"
                        className="text-emerald-600 hover:text-emerald-700"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                      <button
                        onClick={() => updateStatus(m.leadId, "CANCELADA")}
                        title="Cancelar"
                        className="text-slate-400 hover:text-rose-600"
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
