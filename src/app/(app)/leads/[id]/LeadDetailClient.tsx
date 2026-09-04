"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneCall, Loader2, CalendarPlus, CheckCircle2, XCircle } from "lucide-react";
import { StatusBadge, ModeBadge, ChannelBadge } from "@/components/Badges";
import type { Channel, ConversationEvent, Lead, LeadStatus, Meeting } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";

const CHANNEL_DOT: Record<Channel, string> = {
  WHATSAPP: "bg-green-500",
  INSTAGRAM: "bg-pink-500",
  LIGACAO: "bg-indigo-500",
  SISTEMA: "bg-slate-300 dark:bg-slate-600",
};

const MEETING_STATUS_STYLES: Record<Meeting["status"], string> = {
  AGENDADA: "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-400 dark:ring-violet-500/30",
  REALIZADA: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30",
  CANCELADA: "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/30",
};

export function LeadDetailClient({
  lead,
  events,
  meeting,
}: {
  lead: Lead;
  events: ConversationEvent[];
  meeting: Meeting | null;
}) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  async function runAutomation() {
    setRunning(true);
    try {
      await fetch(`/api/leads/${lead.id}/run`, { method: "POST" });
      router.refresh();
    } finally {
      setRunning(false);
    }
  }

  async function changeStatus(status: LeadStatus) {
    await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    setSavingNote(true);
    await fetch(`/api/leads/${lead.id}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: note, channel: "SISTEMA", direction: "ENTRADA" }),
    });
    setNote("");
    setSavingNote(false);
    router.refresh();
  }

  async function updateMeetingStatus(status: "REALIZADA" | "CANCELADA") {
    await fetch(`/api/leads/${lead.id}/meeting`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {lead.name}
          </h1>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <ModeBadge mode={lead.mode} />
            <StatusBadge status={lead.status} />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={runAutomation} disabled={running} className="btn-primary gap-1.5">
            {running ? <Loader2 size={15} className="animate-spin" /> : <PhoneCall size={15} />}
            Rodar automação
          </button>
          <button onClick={() => setShowSchedule(true)} className="btn-secondary gap-1.5">
            <CalendarPlus size={15} /> Agendar reunião
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
              Esboço da conversa (timeline)
            </h2>
            <ul className="mt-4 space-y-4">
              {events.length === 0 && (
                <li className="text-sm text-slate-400 dark:text-slate-500">
                  Nenhum evento ainda.
                </li>
              )}
              {events.map((ev) => (
                <li key={ev.id} className="flex gap-3">
                  <div
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${CHANNEL_DOT[ev.channel]}`}
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <ChannelBadge channel={ev.channel} />
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        {ev.direction === "SAIDA" ? "enviado" : "recebido"} ·{" "}
                        {new Date(ev.createdAt).toLocaleString("pt-BR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      {ev.content}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <form
              onSubmit={addNote}
              className="mt-5 flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800"
            >
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Registrar resposta do lead ou uma nota..."
                className="input"
              />
              <button type="submit" disabled={savingNote} className="btn-secondary shrink-0">
                {savingNote ? "..." : "Adicionar"}
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
              Contato
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label="WhatsApp" value={lead.whatsapp} />
              <Row label="Telefone" value={lead.phone} />
              <Row label="Instagram" value={lead.instagram} />
              <Row label="Origem" value={lead.source} />
            </dl>
          </div>

          <div className="card p-6">
            <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
              Status
            </h2>
            <select
              value={lead.status}
              onChange={(e) => changeStatus(e.target.value as LeadStatus)}
              className="input mt-3"
            >
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {meeting && (
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
                  Reunião
                </h2>
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${MEETING_STATUS_STYLES[meeting.status]}`}
                >
                  {meeting.status}
                </span>
              </div>
              <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                {new Date(meeting.scheduledAt).toLocaleString("pt-BR", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>
              {meeting.notes && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{meeting.notes}</p>
              )}
              {meeting.status === "AGENDADA" && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => updateMeetingStatus("REALIZADA")}
                    className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 active:scale-[0.98] dark:bg-emerald-600 dark:hover:bg-emerald-500"
                  >
                    <CheckCircle2 size={13} /> Realizada
                  </button>
                  <button
                    onClick={() => updateMeetingStatus("CANCELADA")}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 active:scale-[0.98] dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    <XCircle size={13} /> Cancelar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showSchedule && (
        <ScheduleModal
          leadId={lead.id}
          onClose={() => setShowSchedule(false)}
          onDone={() => router.refresh()}
        />
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-400 dark:text-slate-500">{label}</dt>
      <dd className="text-right text-slate-700 dark:text-slate-300">{value || "—"}</dd>
    </div>
  );
}

function ScheduleModal({
  leadId,
  onClose,
  onDone,
}: {
  leadId: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [datetime, setDatetime] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!datetime) return;
    setSaving(true);
    await fetch(`/api/leads/${leadId}/meeting`, {
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
          Agendar reunião
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
              {saving ? "Salvando..." : "Agendar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
