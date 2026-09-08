import { randomUUID } from "crypto";
import { db } from "@/lib/db";

export interface AuditEntry {
  id: string;
  userId: string | null;
  userName: string | null;
  action: string;
  detail: string | null;
  createdAt: string;
}

interface AuditRow {
  id: string;
  user_id: string | null;
  action: string;
  detail: string | null;
  created_at: string;
  user_name: string | null;
}

/** Grava uma linha no log de auditoria. Chamado pela rota (não pelo repo de
 * leads/users) logo depois da mutação sensível já ter sido aplicada — mesmo
 * padrão do addEvent() na timeline do lead. */
export function logAudit(userId: string, action: string, detail?: string): void {
  db.prepare(
    `INSERT INTO audit_log (id, user_id, action, detail, created_at)
     VALUES (@id, @user_id, @action, @detail, @created_at)`
  ).run({
    id: randomUUID(),
    user_id: userId,
    action,
    detail: detail ?? null,
    created_at: new Date().toISOString(),
  });
}

export function listAuditLog(limit = 200): AuditEntry[] {
  const rows = db
    .prepare(
      `SELECT audit_log.*, users.name as user_name
       FROM audit_log
       LEFT JOIN users ON users.id = audit_log.user_id
       ORDER BY audit_log.created_at DESC
       LIMIT ?`
    )
    .all(limit) as AuditRow[];
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    userName: r.user_name,
    action: r.action,
    detail: r.detail,
    createdAt: r.created_at,
  }));
}
