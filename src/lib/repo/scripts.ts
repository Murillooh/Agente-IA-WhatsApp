import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import type { Channel, Mode, SalesScript } from "@/lib/types";

interface ScriptRow {
  id: string;
  name: string;
  mode: Mode;
  channel: Channel;
  content: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

function rowToScript(r: ScriptRow): SalesScript {
  return {
    id: r.id,
    name: r.name,
    mode: r.mode,
    channel: r.channel,
    content: r.content,
    isActive: !!r.is_active,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function listScripts(): SalesScript[] {
  const rows = db
    .prepare("SELECT * FROM scripts ORDER BY mode, channel")
    .all() as ScriptRow[];
  return rows.map(rowToScript);
}

export function getActiveScript(mode: Mode, channel: Channel): SalesScript | null {
  const row = db
    .prepare(
      "SELECT * FROM scripts WHERE mode = ? AND channel = ? AND is_active = 1 ORDER BY updated_at DESC LIMIT 1"
    )
    .get(mode, channel) as ScriptRow | undefined;
  return row ? rowToScript(row) : null;
}

export function createScript(input: {
  name: string;
  mode: Mode;
  channel: Channel;
  content: string;
}): SalesScript {
  const id = randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO scripts (id, name, mode, channel, content, is_active, created_at, updated_at)
     VALUES (@id, @name, @mode, @channel, @content, 1, @now, @now)`
  ).run({ id, ...input, now });
  return db.prepare("SELECT * FROM scripts WHERE id = ?").get(id) as SalesScript;
}

export function updateScript(
  id: string,
  input: Partial<Pick<SalesScript, "name" | "content" | "isActive">>
): SalesScript | null {
  const row = db.prepare("SELECT * FROM scripts WHERE id = ?").get(id) as
    | ScriptRow
    | undefined;
  if (!row) return null;
  const now = new Date().toISOString();
  db.prepare(
    `UPDATE scripts SET name=@name, content=@content, is_active=@isActive, updated_at=@now WHERE id=@id`
  ).run({
    id,
    name: input.name ?? row.name,
    content: input.content ?? row.content,
    isActive: input.isActive === undefined ? row.is_active : input.isActive ? 1 : 0,
    now,
  });
  const updated = db.prepare("SELECT * FROM scripts WHERE id = ?").get(id) as ScriptRow;
  return rowToScript(updated);
}

export function deleteScript(id: string): void {
  db.prepare("DELETE FROM scripts WHERE id = ?").run(id);
}
