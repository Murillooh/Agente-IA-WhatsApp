import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import type { Lead, LeadStatus, Mode } from "@/lib/types";

interface LeadRow {
  id: string;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  source: string | null;
  mode: Mode;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
}

function rowToLead(r: LeadRow): Lead {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone,
    whatsapp: r.whatsapp,
    instagram: r.instagram,
    source: r.source,
    mode: r.mode,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export function listLeads(): Lead[] {
  const rows = db
    .prepare("SELECT * FROM leads ORDER BY created_at DESC")
    .all() as LeadRow[];
  return rows.map(rowToLead);
}

export function getLead(id: string): Lead | null {
  const row = db.prepare("SELECT * FROM leads WHERE id = ?").get(id) as
    | LeadRow
    | undefined;
  return row ? rowToLead(row) : null;
}

export function createLead(input: {
  name: string;
  phone?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  source?: string | null;
  mode: Mode;
}): Lead {
  const now = new Date().toISOString();
  const id = randomUUID();
  db.prepare(
    `INSERT INTO leads (id, name, phone, whatsapp, instagram, source, mode, status, created_at, updated_at)
     VALUES (@id, @name, @phone, @whatsapp, @instagram, @source, @mode, 'NOVO', @now, @now)`
  ).run({
    id,
    name: input.name,
    phone: input.phone ?? null,
    whatsapp: input.whatsapp ?? null,
    instagram: input.instagram ?? null,
    source: input.source ?? null,
    mode: input.mode,
    now,
  });
  return getLead(id)!;
}

export function updateLeadStatus(id: string, status: LeadStatus): Lead | null {
  const now = new Date().toISOString();
  db.prepare("UPDATE leads SET status = ?, updated_at = ? WHERE id = ?").run(
    status,
    now,
    id
  );
  return getLead(id);
}

export function updateLead(
  id: string,
  input: Partial<Pick<Lead, "name" | "phone" | "whatsapp" | "instagram" | "source" | "mode">>
): Lead | null {
  const current = getLead(id);
  if (!current) return null;
  const now = new Date().toISOString();
  db.prepare(
    `UPDATE leads SET name=@name, phone=@phone, whatsapp=@whatsapp, instagram=@instagram, source=@source, mode=@mode, updated_at=@now WHERE id=@id`
  ).run({
    id,
    name: input.name ?? current.name,
    phone: input.phone ?? current.phone,
    whatsapp: input.whatsapp ?? current.whatsapp,
    instagram: input.instagram ?? current.instagram,
    source: input.source ?? current.source,
    mode: input.mode ?? current.mode,
    now,
  });
  return getLead(id);
}

export function deleteLead(id: string): void {
  db.prepare("DELETE FROM leads WHERE id = ?").run(id);
}

export function countLeadsByStatus(): Record<LeadStatus, number> {
  const rows = db
    .prepare("SELECT status, COUNT(*) as c FROM leads GROUP BY status")
    .all() as { status: LeadStatus; c: number }[];
  const base: Record<LeadStatus, number> = {
    NOVO: 0,
    CONTATADO: 0,
    RESPONDENDO: 0,
    REUNIAO_AGENDADA: 0,
    FECHADO: 0,
    PERDIDO: 0,
  };
  for (const r of rows) base[r.status] = r.c;
  return base;
}

export function countLeadsByMode(): Record<Mode, number> {
  const rows = db
    .prepare("SELECT mode, COUNT(*) as c FROM leads GROUP BY mode")
    .all() as { mode: Mode; c: number }[];
  const base: Record<Mode, number> = { MODO_1: 0, MODO_2: 0 };
  for (const r of rows) base[r.mode] = r.c;
  return base;
}
