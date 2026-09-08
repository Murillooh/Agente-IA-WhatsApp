"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, CalendarClock, CalendarCog } from "lucide-react";
import type { Meeting } from "@/lib/types";

type MeetingRow = Meeting & { leadName: string };

const statusStyles: Record<string, string> = {
  AGENDADA: "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-500/30",
  REALIZADA: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30",
  CANCELADA: "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/30",
};

export function MeetingsClient({ meetings }: { meetings: MeetingRow[] }) {
  const router = useRouter();
  const [rescheduling, setRescheduling] = useState<MeetingRow | null>(null);

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
                  <div className="flex gap-2">
                    <button
                      onClick={() => setRescheduling(m)}
                      title="Reagendar"
                      className="text-slate-400 transition-colors hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400"
                    >
                      <CalendarCog size={16} />
                    </button>
                    {m.status === "AGENDADA" && (
                      <>
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
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rescheduling && (
        <RescheduleModal
          meeting={rescheduling}
          onClose={() => setRescheduling(null)}
          onDone={() => router.refresh()}
        />
      )}
    </div>
  );
}

// "2026-09-08T21:25" — formato que <input type="datetime-local"> espera,
// no fuso local do navegador (toISOString() sempre devolve UTC).
function toLocalInputValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function RescheduleModal({
  meeting,
  onClose,
  onDone,
}: {
  meeting: MeetingRow;
  onClose: () => void;
  onDone: () => void;
}) {
  const [datetime, setDatetime] = useState(toLocalInputValue(meeting.scheduledAt));
  const [notes, setNotes] = useState(meeting.notes ?? "");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!datetime) return;
    setSaving(true);
    await fetch(`/api/leads/${meeting.leadId}/meeting`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scheduledAt: new Date(datetime).toISOString(),
        notes,
      }),
    });
    setSaving(false);
    onDone();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl ring-1 ring-slate-900/5 dark:bg-slate-800 dark:ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
          Reagendar — {meeting.leadName}
        </h3>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
              Data e hora
            </span>
            <input
              required
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              className="input"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
              Notas
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="input"
            />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Salvando..." : "Reagendar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
