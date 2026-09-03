"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Trash2 } from "lucide-react";
import type { Channel, Mode, SalesScript } from "@/lib/types";
import { CHANNEL_LABELS, MODE_LABELS } from "@/lib/types";

export function ScriptsClient({ scripts }: { scripts: SalesScript[] }) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Scripts de vendas</h1>
          <p className="mt-1 text-sm text-slate-500">
            Um script ativo por combinação de Modo + Canal é usado automaticamente ao
            rodar a automação de um lead.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus size={15} /> Novo script
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {scripts.map((s) => (
          <ScriptCard key={s.id} script={s} onChange={() => router.refresh()} />
        ))}
        {scripts.length === 0 && (
          <p className="text-sm text-slate-400">Nenhum script ainda.</p>
        )}
      </div>

      {showAdd && (
        <AddScriptModal onClose={() => setShowAdd(false)} onDone={() => router.refresh()} />
      )}
    </div>
  );
}

function ScriptCard({ script, onChange }: { script: SalesScript; onChange: () => void }) {
  const [content, setContent] = useState(script.content);
  const [saving, setSaving] = useState(false);
  const dirty = content !== script.content;

  async function save() {
    setSaving(true);
    await fetch(`/api/scripts/${script.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setSaving(false);
    onChange();
  }

  async function remove() {
    await fetch(`/api/scripts/${script.id}`, { method: "DELETE" });
    onChange();
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">{script.name}</p>
          <p className="mt-0.5 text-xs text-slate-400">
            {MODE_LABELS[script.mode]} · {CHANNEL_LABELS[script.channel]}
          </p>
        </div>
        <button onClick={remove} className="text-slate-300 hover:text-rose-600">
          <Trash2 size={15} />
        </button>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        className="input mt-3 text-sm"
      />
      <p className="mt-1 text-[11px] text-slate-400">
        Use <code>{"{{nome}}"}</code> para inserir o nome do lead.
      </p>
      {dirty && (
        <button
          onClick={save}
          disabled={saving}
          className="btn-primary mt-2 flex items-center gap-1.5"
        >
          <Save size={13} /> {saving ? "Salvando..." : "Salvar alteração"}
        </button>
      )}
    </div>
  );
}

function AddScriptModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [form, setForm] = useState({
    name: "",
    mode: "MODO_1" as Mode,
    channel: "WHATSAPP" as Channel,
    content: "",
  });
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/scripts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    onDone();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-base font-semibold text-slate-900">Novo script</h3>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">Nome</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">Modo</span>
              <select
                value={form.mode}
                onChange={(e) => setForm({ ...form, mode: e.target.value as Mode })}
                className="input"
              >
                <option value="MODO_1">Modo 1</option>
                <option value="MODO_2">Modo 2</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">Canal</span>
              <select
                value={form.channel}
                onChange={(e) => setForm({ ...form, channel: e.target.value as Channel })}
                className="input"
              >
                <option value="WHATSAPP">WhatsApp</option>
                <option value="INSTAGRAM">Instagram</option>
                <option value="LIGACAO">Ligação</option>
              </select>
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">Conteúdo</span>
            <textarea
              required
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={5}
              className="input"
            />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Salvando..." : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
