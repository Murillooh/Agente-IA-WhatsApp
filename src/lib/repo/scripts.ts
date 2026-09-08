import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import type { Channel, Mode, SalesScript } from "@/lib/types";

interface ScriptRow {
  id: string;
  group_id: string;
  version: number;
  name: string;
  mode: Mode;
  channel: Channel;
  content: string;
  weight: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

function rowToScript(r: ScriptRow): SalesScript {
  return {
    id: r.id,
    groupId: r.group_id,
    version: r.version,
    name: r.name,
    mode: r.mode,
    channel: r.channel,
    content: r.content,
    weight: r.weight,
    isActive: !!r.is_active,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function getRow(id: string): ScriptRow | undefined {
  return db.prepare("SELECT * FROM scripts WHERE id = ?").get(id) as ScriptRow | undefined;
}

/** Todas as linhas (ativas e histórico) — quem exibe agrupa por groupId. */
export function listScripts(): SalesScript[] {
  const rows = db
    .prepare("SELECT * FROM scripts ORDER BY mode, channel, version DESC")
    .all() as ScriptRow[];
  return rows.map(rowToScript);
}

/**
 * Escolhe o script pra usar num disparo. Quando só uma variante do
 * Modo+Canal está ativa, é sempre ela. Quando duas ou mais estão ativas
 * (grupos diferentes competindo no mesmo Modo+Canal = teste A/B), sorteia
 * por peso (weight) — sem "modo A/B" separado, é o estado natural de ter
 * mais de uma variante ligada ao mesmo tempo.
 */
export function getActiveScript(mode: Mode, channel: Channel): SalesScript | null {
  const rows = db
    .prepare("SELECT * FROM scripts WHERE mode = ? AND channel = ? AND is_active = 1")
    .all(mode, channel) as ScriptRow[];
  if (rows.length === 0) return null;
  if (rows.length === 1) return rowToScript(rows[0]);

  const totalWeight = rows.reduce((sum, r) => sum + Math.max(0, r.weight), 0);
  if (totalWeight <= 0) return rowToScript(rows[0]);

  let roll = Math.random() * totalWeight;
  for (const r of rows) {
    roll -= Math.max(0, r.weight);
    if (roll <= 0) return rowToScript(r);
  }
  return rowToScript(rows[rows.length - 1]);
}

export function createScript(input: {
  name: string;
  mode: Mode;
  channel: Channel;
  content: string;
  weight?: number;
}): SalesScript {
  const id = randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO scripts (id, group_id, version, name, mode, channel, content, weight, is_active, created_at, updated_at)
     VALUES (@id, @id, 1, @name, @mode, @channel, @content, @weight, 1, @now, @now)`
  ).run({
    id,
    name: input.name,
    mode: input.mode,
    channel: input.channel,
    content: input.content,
    weight: input.weight ?? 100,
    now,
  });
  return rowToScript(getRow(id)!);
}

/**
 * Salvar conteúdo novo não sobrescreve a linha: cria uma versão nova (mesmo
 * groupId, version+1, herda ativo/peso) e desativa a anterior. Histórico
 * fica só-leitura — não tem "reverter com um clique" nessa primeira versão,
 * de propósito (evita duas versões do mesmo grupo ativas ao mesmo tempo).
 */
export function editScriptContent(
  id: string,
  input: { name?: string; content: string; weight?: number }
): SalesScript | null {
  const current = getRow(id);
  if (!current) return null;

  const newId = randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO scripts (id, group_id, version, name, mode, channel, content, weight, is_active, created_at, updated_at)
     VALUES (@id, @group_id, @version, @name, @mode, @channel, @content, @weight, @is_active, @now, @now)`
  ).run({
    id: newId,
    group_id: current.group_id,
    version: current.version + 1,
    name: input.name ?? current.name,
    mode: current.mode,
    channel: current.channel,
    content: input.content,
    weight: input.weight ?? current.weight,
    is_active: current.is_active,
    now,
  });
  db.prepare("UPDATE scripts SET is_active = 0, updated_at = ? WHERE id = ?").run(now, id);

  return rowToScript(getRow(newId)!);
}

/** Ajuste que NÃO conta como edição de conteúdo — liga/desliga a variante,
 * renomeia, ou muda o peso do sorteio. Não gera versão nova. */
export function patchScriptMeta(
  id: string,
  input: Partial<Pick<SalesScript, "name" | "isActive" | "weight">>
): SalesScript | null {
  const current = getRow(id);
  if (!current) return null;
  const now = new Date().toISOString();
  db.prepare(
    `UPDATE scripts SET name=@name, weight=@weight, is_active=@is_active, updated_at=@now WHERE id=@id`
  ).run({
    id,
    name: input.name ?? current.name,
    weight: input.weight ?? current.weight,
    is_active: input.isActive === undefined ? current.is_active : input.isActive ? 1 : 0,
    now,
  });
  return rowToScript(getRow(id)!);
}

export function deleteScript(id: string): void {
  db.prepare("DELETE FROM scripts WHERE id = ?").run(id);
}

export interface ScriptStats {
  sent: number;
  closed: number;
}

/** De todos os leads que essa variante (linha exata, não o grupo todo)
 * contatou, quantos fecharam — a base pra comparar quem ganhou o teste A/B. */
export function scriptStats(scriptId: string): ScriptStats {
  const row = db
    .prepare(
      `SELECT COUNT(DISTINCT ce.lead_id) as sent,
              COUNT(DISTINCT CASE WHEN l.status = 'FECHADO' THEN ce.lead_id END) as closed
       FROM conversation_events ce
       JOIN leads l ON l.id = ce.lead_id
       WHERE ce.script_id = ?`
    )
    .get(scriptId) as { sent: number; closed: number };
  return row;
}
