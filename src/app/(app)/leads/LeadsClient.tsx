"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Upload, Download, PhoneCall, Loader2, Users, Search, X } from "lucide-react";
import { StatusBadge, ModeBadge } from "@/components/Badges";
import type { Lead, LeadStatus, Mode } from "@/lib/types";
import { MODE_LABELS, STATUS_LABELS } from "@/lib/types";

export function LeadsClient({ leads }: { leads: Lead[] }) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [running, setRunning] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "ALL">("ALL");
  const [modeFilter, setModeFilter] = useState<Mode | "ALL">("ALL");

  const filtersActive = search.trim() !== "" || statusFilter !== "ALL" || modeFilter !== "ALL";

  const filteredLeads = useMemo(() => {
    const term = search.trim().toLowerCase();
    return leads.filter((lead) => {
      if (statusFilter !== "ALL" && lead.status !== statusFilter) return false;
      if (modeFilter !== "ALL" && lead.mode !== modeFilter) return false;
      if (term) {
        const haystack = [lead.name, lead.whatsapp, lead.phone, lead.instagram, lead.source]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [leads, search, statusFilter, modeFilter]);

  function clearFilters() {
    setSearch("");
    setStatusFilter("ALL");
    setModeFilter("ALL");
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => {
      const visibleIds = filteredLeads.map((l) => l.id);
      const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => prev.has(id));
      if (allVisibleSelected) return new Set();
      return new Set(visibleIds);
    });
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Leads</h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            {filtersActive
              ? `${filteredLeads.length} de ${leads.length} lead(s).`
              : `${leads.length} lead(s) cadastrado(s).`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/api/leads/export" className="btn-secondary gap-1.5">
            <Download size={15} /> Exportar CSV
          </Link>
          <button onClick={() => setShowImport(true)} className="btn-secondary gap-1.5">
            <Upload size={15} /> Importar CSV
          </button>
          <button onClick={() => setShowAdd(true)} className="btn-primary gap-1.5">
            <Plus size={15} /> Novo lead
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, contato ou origem..."
            className="input pl-9"
          />
        </div>
        <div className="w-full shrink-0 sm:w-44">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as LeadStatus | "ALL")}
            className="input"
          >
            <option value="ALL">Todos os status</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full shrink-0 sm:w-60">
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value as Mode | "ALL")}
            className="input"
          >
            <option value="ALL">Todos os modos</option>
            {Object.entries(MODE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        {filtersActive && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <X size={14} /> Limpar
          </button>
        )}
      </div>

      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-2.5 dark:border-indigo-500/20 dark:bg-indigo-500/10">
          <span className="text-sm font-medium text-indigo-700 dark:text-indigo-400">
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
          <thead className="border-b border-slate-100 text-xs font-medium uppercase tracking-wide text-slate-400 dark:border-slate-800 dark:text-slate-500">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={
                    filteredLeads.length > 0 &&
                    filteredLeads.every((l) => selected.has(l.id))
                  }
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900"
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
            {filteredLeads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-300 dark:bg-slate-800 dark:text-slate-600">
                      <Users size={20} />
                    </span>
                    <p className="text-sm text-slate-400 dark:text-slate-500">
                      {leads.length === 0
                        ? "Nenhum lead ainda. Importe um CSV ou adicione manualmente."
                        : "Nenhum lead encontrado com esse filtro."}
                    </p>
                    {filtersActive && leads.length > 0 && (
                      <button
                        onClick={clearFilters}
                        className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                      >
                        Limpar filtros
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
            {filteredLeads.map((lead) => (
              <tr
                key={lead.id}
                className="border-b border-slate-50 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800/60 dark:hover:bg-slate-800/50"
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(lead.id)}
                    onChange={() => toggle(lead.id)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900"
                  />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/leads/${lead.id}`}
                    className="font-medium text-slate-900 hover:text-indigo-600 hover:underline dark:text-white dark:hover:text-indigo-400"
                  >
                    {lead.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                  {lead.whatsapp || lead.phone || lead.instagram || "—"}
                </td>
                <td className="px-4 py-3">
                  <ModeBadge mode={lead.mode} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{lead.source || "—"}</td>
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
        {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
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
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Cole abaixo, com cabeçalho. Colunas:{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800">
            name, whatsapp, phone, instagram, source, mode
          </code>{" "}
          (mode: MODO_1 ou MODO_2).
        </p>
        <textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          rows={8}
          className="input font-mono text-xs"
        />
        {result && (
          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            <p className="font-medium text-emerald-700 dark:text-emerald-400">
              {result.created} lead(s) importado(s).
            </p>
            {result.errors.length > 0 && (
              <ul className="mt-1 list-disc pl-4 text-rose-600 dark:text-rose-400">
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
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl ring-1 ring-slate-900/5 dark:bg-slate-800 dark:ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h3>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">{label}</span>
      {children}
    </label>
  );
}
