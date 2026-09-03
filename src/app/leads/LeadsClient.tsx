"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Upload, PhoneCall, Loader2, Users } from "lucide-react";
import { StatusBadge, ModeBadge } from "@/components/Badges";
import type { Lead, Mode } from "@/lib/types";

export function LeadsClient({ leads }: { leads: Lead[] }) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [running, setRunning] = useState(false);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) =>
      prev.size === leads.length ? new Set() : new Set(leads.map((l) => l.id))
    );
  }

  async function runBatch() {
    if (selected.size === 0) return;
    setRunning(true);
    try {
      await fetch("/api/leads/run-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadIds: Array.from(selected) }),
      });
      setSelected(new Set());
      router.refresh();
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Leads</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            {leads.length} lead(s) cadastrado(s).
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowImport(true)} className="btn-secondary gap-1.5">
            <Upload size={15} /> Importar CSV
          </button>
          <button onClick={() => setShowAdd(true)} className="btn-primary gap-1.5">
            <Plus size={15} /> Novo lead
          </button>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-2.5">
          <span className="text-sm font-medium text-indigo-700">
            {selected.size} lead(s) selecionado(s)
          </span>
          <button onClick={runBatch} disabled={running} className="btn-primary gap-1.5">
            {running ? <Loader2 size={14} className="animate-spin" /> : <PhoneCall size={14} />}
            Rodar automação em lote
          </button>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={leads.length > 0 && selected.size === leads.length}
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Contato</th>
              <th className="px-4 py-3">Modo</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Origem</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                      <Users size={20} />
                    </span>
                    <p className="text-sm text-slate-400">
                      Nenhum lead ainda. Importe um CSV ou adicione manualmente.
                    </p>
                  </div>
                </td>
              </tr>
            )}
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className="border-b border-slate-50 transition-colors last:border-0 hover:bg-slate-50"
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(lead.id)}
                    onChange={() => toggle(lead.id)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/leads/${lead.id}`}
                    className="font-medium text-slate-900 hover:text-indigo-600 hover:underline"
                  >
                    {lead.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {lead.whatsapp || lead.phone || lead.instagram || "—"}
                </td>
                <td className="px-4 py-3">
                  <ModeBadge mode={lead.mode} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="px-4 py-3 text-slate-500">{lead.source || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && <AddLeadModal onClose={() => setShowAdd(false)} onDone={() => router.refresh()} />}
      {showImport && (
        <ImportCsvModal onClose={() => setShowImport(false)} onDone={() => router.refresh()} />
      )}
    </div>
  );
}

function AddLeadModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [form, setForm] = useState({
    name: "",
    whatsapp: "",
    phone: "",
    instagram: "",
    source: "",
    mode: "MODO_1" as Mode,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erro ao criar lead.");
      return;
    }
    onDone();
    onClose();
  }

  return (
    <Modal onClose={onClose} title="Novo lead">
      <form onSubmit={submit} className="space-y-3">
        <Field label="Nome *">
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input"
          />
        </Field>
        <Field label="WhatsApp">
          <input
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            placeholder="+55 11 90000-0000"
            className="input"
          />
        </Field>
        <Field label="Telefone (ligação)">
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+55 11 90000-0000"
            className="input"
          />
        </Field>
        <Field label="Instagram">
          <input
            value={form.instagram}
            onChange={(e) => setForm({ ...form, instagram: e.target.value })}
            placeholder="@usuario"
            className="input"
          />
        </Field>
        <Field label="Origem">
          <input
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
            placeholder="Ex: lista de prospecção X"
            className="input"
          />
        </Field>
        <Field label="Modo">
          <select
            value={form.mode}
            onChange={(e) => setForm({ ...form, mode: e.target.value as Mode })}
            className="input"
          >
            <option value="MODO_1">Modo 1 · WhatsApp/Instagram</option>
            <option value="MODO_2">Modo 2 · WhatsApp/Instagram + Ligação</option>
          </select>
        </Field>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Salvando..." : "Adicionar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ImportCsvModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [csv, setCsv] = useState("name,whatsapp,phone,instagram,source,mode\n");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ created: number; errors: string[] } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/leads/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv }),
    });
    const data = await res.json();
    setSaving(false);
    setResult(data);
    if (res.ok) onDone();
  }

  return (
    <Modal onClose={onClose} title="Importar leads via CSV">
      <form onSubmit={submit} className="space-y-3">
        <p className="text-xs text-slate-500">
          Cole abaixo, com cabeçalho. Colunas: <code>name, whatsapp, phone, instagram, source, mode</code>{" "}
          (mode: MODO_1 ou MODO_2).
        </p>
        <textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          rows={8}
          className="input font-mono text-xs"
        />
        {result && (
          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            <p className="font-medium text-emerald-700">
              {result.created} lead(s) importado(s).
            </p>
            {result.errors.length > 0 && (
              <ul className="mt-1 list-disc pl-4 text-rose-600">
                {result.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Fechar
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Importando..." : "Importar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl ring-1 ring-slate-900/5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold tracking-tight text-slate-900">{title}</h3>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}
