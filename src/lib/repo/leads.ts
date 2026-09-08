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

// Toda função aqui recebe userId e filtra por ele — é isso que isola os
// leads de cada conta. Nenhuma consulta de lead deve rodar sem esse filtro.

/** from/to já vêm como ISO completo (o chamador resolve o fuso/dia). */
export interface DateRange {
  from?: string;
  to?: string;
}

function rangeClause(range: DateRange | undefined, params: unknown[]): string {
  let clause = "";
  if (range?.from) {
    clause += " AND created_at >= ?";
    params.push(range.from);
  }
  if (range?.to) {
    clause += " AND created_at <= ?";
    params.push(range.to);
  }
  return clause;
}

export function listLeads(userId: string, range?: DateRange): Lead[] {
  const params: unknown[] = [userId];
  const sql =
    "SELECT * FROM leads WHERE user_id = ?" + rangeClause(range, params) + " ORDER BY created_at DESC";
  const rows = db.prepare(sql).all(...params) as LeadRow[];
  return rows.map(rowToLead);
}

export function getLead(id: string, userId: string): Lead | null {
  const row = db.prepare("SELECT * FROM leads WHERE id = ? AND user_id = ?").get(id, userId) as
    | LeadRow
    | undefined;
  return row ? rowToLead(row) : null;
}

export function createLead(
  userId: string,
  input: {
    name: string;
    phone?: string | null;
    whatsapp?: string | null;
    instagram?: string | null;
    source?: string | null;
    mode: Mode;
  }
): Lead {
  const now = new Date().toISOString();
  const id = randomUUID();
  db.prepare(
    `INSERT INTO leads (id, user_id, name, phone, whatsapp, instagram, source, mode, status, created_at, updated_at)
     VALUES (@id, @user_id, @name, @phone, @whatsapp, @instagram, @source, @mode, 'NOVO', @now, @now)`
  ).run({
    id,
    user_id: userId,
    name: input.name,
    phone: input.phone ?? null,
    whatsapp: input.whatsapp ?? null,
    instagram: input.instagram ?? null,
    source: input.source ?? null,
    mode: input.mode,
    now,
  });
  return getLead(id, userId)!;
}

export function updateLeadStatus(
  id: string,
  userId: string,
  status: LeadStatus
): Lead | null {
  const now = new Date().toISOString();
  db.prepare("UPDATE leads SET status = ?, updated_at = ? WHERE id = ? AND user_id = ?").run(
    status,
    now,
    id,
    userId
  );
  return getLead(id, userId);
}

export function updateLead(
  id: string,
  userId: string,
  input: Partial<Pick<Lead, "name" | "phone" | "whatsapp" | "instagram" | "source" | "mode">>
): Lead | null {
  const current = getLead(id, userId);
  if (!current) return null;
  const now = new Date().toISOString();
  db.prepare(
    `UPDATE leads SET name=@name, phone=@phone, whatsapp=@whatsapp, instagram=@instagram, source=@source, mode=@mode, updated_at=@now WHERE id=@id AND user_id=@user_id`
  ).run({
    id,
    user_id: userId,
    name: input.name ?? current.name,
    phone: input.phone ?? current.phone,
    whatsapp: input.whatsapp ?? current.whatsapp,
    instagram: input.instagram ?? current.instagram,
    source: input.source ?? current.source,
    mode: input.mode ?? current.mode,
    now,
  });
  return getLead(id, userId);
}

export function deleteLead(id: string, userId: string): void {
  db.prepare("DELETE FROM leads WHERE id = ? AND user_id = ?").run(id, userId);
}

export function countLeadsByStatus(userId: string, range?: DateRange): Record<LeadStatus, number> {
  const params: unknown[] = [userId];
  const sql =
    "SELECT status, COUNT(*) as c FROM leads WHERE user_id = ?" +
    rangeClause(range, params) +
    " GROUP BY status";
  const rows = db.prepare(sql).all(...params) as { status: LeadStatus; c: number }[];
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

export function countLeadsByMode(userId: string, range?: DateRange): Record<Mode, number> {
  const params: unknown[] = [userId];
  const sql =
    "SELECT mode, COUNT(*) as c FROM leads WHERE user_id = ?" +
    rangeClause(range, params) +
    " GROUP BY mode";
  const rows = db.prepare(sql).all(...params) as { mode: Mode; c: number }[];
  const base: Record<Mode, number> = { MODO_1: 0, MODO_2: 0 };
  for (const r of rows) base[r.mode] = r.c;
  return base;
}

/** Média de dias entre criado e fechado — usa updated_at do lead FECHADO
 * como aproximação da data de fechamento (não existe uma coluna própria
 * pra isso hoje). null se não tiver nenhum lead fechado no período. */
export function averageDaysToClose(userId: string, range?: DateRange): number | null {
  const params: unknown[] = [userId];
  const sql =
    `SELECT AVG(julianday(updated_at) - julianday(created_at)) as avg_days
     FROM leads WHERE user_id = ? AND status = 'FECHADO'` + rangeClause(range, params);
  const row = db.prepare(sql).get(...params) as { avg_days: number | null };
  return row.avg_days;
}

export interface SourceConversion {
  source: string;
  total: number;
  closed: number;
}

export function conversionBySource(userId: string, range?: DateRange): SourceConversion[] {
  const params: unknown[] = [userId];
  const sql =
    `SELECT COALESCE(source, 'Sem origem') as source,
            COUNT(*) as total,
            SUM(CASE WHEN status = 'FECHADO' THEN 1 ELSE 0 END) as closed
     FROM leads WHERE user_id = ?` +
    rangeClause(range, params) +
    ` GROUP BY COALESCE(source, 'Sem origem') ORDER BY total DESC`;
  return db.prepare(sql).all(...params) as SourceConversion[];
}
