"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Trash2, ChevronDown, ChevronUp, FlaskConical } from "lucide-react";
import type { Channel, Mode, SalesScript } from "@/lib/types";
import { CHANNEL_LABELS, MODE_LABELS } from "@/lib/types";
import type { ScriptStats } from "@/lib/repo/scripts";

interface Lineage {
  groupId: string;
  current: SalesScript;
  history: SalesScript[];
}

// Agrupa a lista achatada (todas as versões de todos os scripts) em uma
// "linhagem" por groupId — a versão mais alta vira a atual, o resto é
// histórico só-leitura.
function groupByLineage(scripts: SalesScript[]): Lineage[] {
  const byGroup = new Map<string, Lineage>();
  for (const s of scripts) {
    const g = byGroup.get(s.groupId);
    if (!g) {
      byGroup.set(s.groupId, { groupId: s.groupId, current: s, history: [] });
    } else if (s.version > g.current.version) {
      g.history.push(g.current);
      g.current = s;
    } else {
      g.history.push(s);
    }
  }
  const groups = Array.from(byGroup.values());
  for (const g of groups) g.history.sort((a, b) => b.version - a.version);
  return groups;
}

export function ScriptsClient({
  scripts,
  stats,
}: {
  scripts: SalesScript[];
  stats: Record<string, ScriptStats>;
}) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);

  // "slot" = Modo+Canal. Duas ou mais linhagens ativas no mesmo slot é o
  // teste A/B acontecendo — não é um modo à parte pra ligar.
  const slots = useMemo(() => {
    const bySlot = new Map<string, Lineage[]>();
    for (const g of groupByLineage(scripts)) {
      const key = `${g.current.mode}|${g.current.channel}`;
      if (!bySlot.has(key)) bySlot.set(key, []);
      bySlot.get(key)!.push(g);
    }
    return bySlot;
  }, [scripts]);

  const slotKeys = Array.from(slots.keys()).sort();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Scripts de vendas
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Um script ativo por combinação de Modo + Canal é usado automaticamente ao
            rodar a automação de um lead. Criar um segundo script pro mesmo par começa um
            teste A/B entre os dois.
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary gap-1.5">
          <Plus size={15} /> Novo script
        </button>
      </div>

      <div className="space-y-6">
        {slotKeys.map((key) => {
          const lineages = slots.get(key)!;
          const [mode, channel] = key.split("|") as [Mode, Channel];
          const activeCount = lineages.filter((g) => g.current.isActive).length;
          return (
            <div key={key}>
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  {MODE_LABELS[mode]} · {CHANNEL_LABELS[channel]}
                </h2>
                {activeCount >= 2 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700 dark:bg-violet-500/10 dark:text-violet-400">
                    <FlaskConical size={11} /> Teste A/B · {activeCount} variantes
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {lineages.map((g) => (
                  <ScriptCard
                    key={g.groupId}
                    lineage={g}
                    stats={stats[g.current.id]}
                    showWeight={activeCount >= 2}
                    onChange={() => router.refresh()}
                  />
                ))}
              </div>
            </div>
          );
        })}
        {scripts.length === 0 && (
          <p className="text-sm text-slate-400 dark:text-slate-500">Nenhum script ainda.</p>
        )}
      </div>

      {showAdd && (
        <AddScriptModal onClose={() => setShowAdd(false)} onDone={() => router.refresh()} />
      )}
    </div>
  );
}

function ScriptCard({
  lineage,
  stats,
  showWeight,
  onChange,
}: {
  lineage: Lineage;
  stats: ScriptStats | undefined;
  showWeight: boolean;
  onChange: () => void;
}) {
  const script = lineage.current;
  const [content, setContent] = useState(script.content);
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const dirty = content !== script.content;

  // Ressincroniza sem useEffect quando o "atual" muda de linha (depois de
  // salvar, o id vira o da versão nova) — mesmo padrão usado no KanbanView.
  const [syncedId, setSyncedId] = useState(script.id);
  if (script.id !== syncedId) {
    setSyncedId(script.id);
    setContent(script.content);
  }

  async function patch(body: Record<string, unknown>) {
    await fetch(`/api/scripts/${script.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    onChange();
  }

  async function save() {
    setSaving(true);
    await patch({ content });
    setSaving(false);
  }

  async function remove() {
    await fetch(`/api/scripts/${script.id}`, { method: "DELETE" });
    onChange();
  }

  const rate = stats && stats.sent > 0 ? Math.round((stats.closed / stats.sent) * 100) : null;

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
              {script.name}
            </p>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 dark:bg-slate-800 dark:text-slate-500">
              v{script.version}
            </span>
          </div>
          <label className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <input
              type="checkbox"
              checked={script.isActive}
              onChange={(e) => patch({ isActive: e.target.checked })}
              className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900"
            />
            Ativo
          </label>
        </div>
        <button
          onClick={remove}
          className="text-slate-300 transition-colors hover:text-rose-600 dark:text-slate-600 dark:hover:text-rose-400"
        >
          <Trash2 size={15} />
        </button>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        className="input mt-3 text-sm leading-relaxed"
      />
      <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
        Variáveis:{" "}
        <code className="rounded bg-slate-50 px-1 py-0.5 dark:bg-slate-800">
          {"{{nome}}"}
        </code>{" "}
        <code className="rounded bg-slate-50 px-1 py-0.5 dark:bg-slate-800">
          {"{{origem}}"}
        </code>{" "}
        <code className="rounded bg-slate-50 px-1 py-0.5 dark:bg-slate-800">
          {"{{telefone}}"}
        </code>
      </p>

      {showWeight && (
        <label className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          Peso no sorteio
          <input
            type="number"
            min={0}
            defaultValue={script.weight}
            onBlur={(e) => patch({ weight: Number(e.target.value) || 0 })}
            className="input w-20 py-1"
          />
        </label>
      )}

      {stats && stats.sent > 0 && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {stats.sent} enviado(s) · {stats.closed} fechado(s) ·{" "}
          <span className="font-medium text-slate-700 dark:text-slate-300">{rate}%</span>
        </p>
      )}

      {dirty && (
        <button onClick={save} disabled={saving} className="btn-primary mt-2 gap-1.5">
          <Save size={13} /> {saving ? "Salvando..." : "Salvar como nova versão"}
        </button>
      )}

      {lineage.history.length > 0 && (
        <div className="mt-3 border-t border-slate-100 pt-2 dark:border-slate-800">
          <button
            onClick={() => setShowHistory((v) => !v)}
            className="flex items-center gap-1 text-xs font-medium text-slate-400 transition-colors hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          >
            {showHistory ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {lineage.history.length} versão(ões) anterior(es)
          </button>
          {showHistory && (
            <ul className="mt-2 space-y-2">
              {lineage.history.map((h) => (
                <li
                  key={h.id}
                  className="rounded-lg bg-slate-50 p-2 text-xs text-slate-500 dark:bg-slate-800/60 dark:text-slate-400"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                    <span>v{h.version}</span>
                    <span>
                      {new Date(h.updatedAt).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap">{h.content}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
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
    weight: 100,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl ring-1 ring-slate-900/5 dark:bg-slate-800 dark:ring-white/10">
        <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
          Novo script
        </h3>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
              Nome
            </span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                Modo
              </span>
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
              <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
                Canal
              </span>
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
            <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
              Conteúdo
            </span>
            <textarea
              required
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={5}
              className="input"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
              Peso no sorteio (só importa se já existir outro script ativo pro mesmo
              Modo+Canal)
            </span>
            <input
              type="number"
              min={0}
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: Number(e.target.value) || 0 })}
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
