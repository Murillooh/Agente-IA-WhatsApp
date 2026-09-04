import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import type { Meeting, MeetingStatus } from "@/lib/types";

interface MeetingRow {
  id: string;
  lead_id: string;
  scheduled_at: string;
  status: MeetingStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function rowToMeeting(r: MeetingRow): Meeting {
  return {
    id: r.id,
    leadId: r.lead_id,
    scheduledAt: r.scheduled_at,
    status: r.status,
    notes: r.notes,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// Reuniões não têm coluna própria de dono — a gente sempre passa pelo
// lead (JOIN em leads.user_id) pra saber se pertencem ao usuário atual.

export function getMeetingForLead(leadId: string, userId: string): Meeting | null {
  const row = db
    .prepare(
      `SELECT m.* FROM meetings m
       JOIN leads l ON l.id = m.lead_id
       WHERE m.lead_id = ? AND l.user_id = ?`
    )
    .get(leadId, userId) as MeetingRow | undefined;
  return row ? rowToMeeting(row) : null;
}

export function listMeetings(userId: string): (Meeting & { leadName: string })[] {
  const rows = db
    .prepare(
      `SELECT m.*, l.name as lead_name FROM meetings m
       JOIN leads l ON l.id = m.lead_id
       WHERE l.user_id = ?
       ORDER BY m.scheduled_at ASC`
    )
    .all(userId) as (MeetingRow & { lead_name: string })[];
  return rows.map((r) => ({ ...rowToMeeting(r), leadName: r.lead_name }));
}

export function upsertMeeting(
  userId: string,
  input: { leadId: string; scheduledAt: string; notes?: string | null }
): Meeting | null {
  const ownsLead = db
    .prepare("SELECT 1 FROM leads WHERE id = ? AND user_id = ?")
    .get(input.leadId, userId);
  if (!ownsLead) return null;

  const existing = getMeetingForLead(input.leadId, userId);
  const now = new Date().toISOString();
  if (existing) {
    db.prepare(
      `UPDATE meetings SET scheduled_at=@scheduledAt, notes=@notes, status='AGENDADA', updated_at=@now WHERE lead_id=@leadId`
    ).run({
      leadId: input.leadId,
      scheduledAt: input.scheduledAt,
      notes: input.notes ?? null,
      now,
    });
  } else {
    db.prepare(
      `INSERT INTO meetings (id, lead_id, scheduled_at, status, notes, created_at, updated_at)
       VALUES (@id, @leadId, @scheduledAt, 'AGENDADA', @notes, @now, @now)`
    ).run({
      id: randomUUID(),
      leadId: input.leadId,
      scheduledAt: input.scheduledAt,
      notes: input.notes ?? null,
      now,
    });
  }
  return getMeetingForLead(input.leadId, userId);
}

export function updateMeetingStatus(
  leadId: string,
  userId: string,
  status: MeetingStatus
): Meeting | null {
  const now = new Date().toISOString();
  db.prepare(
    `UPDATE meetings SET status = @status, updated_at = @now
     WHERE lead_id = @leadId AND lead_id IN (SELECT id FROM leads WHERE user_id = @userId)`
  ).run({ status, now, leadId, userId });
  return getMeetingForLead(leadId, userId);
}

export function countUpcomingMeetings(userId: string): number {
  const row = db
    .prepare(
      `SELECT COUNT(*) as c FROM meetings m
       JOIN leads l ON l.id = m.lead_id
       WHERE m.status = 'AGENDADA' AND m.scheduled_at >= datetime('now') AND l.user_id = ?`
    )
    .get(userId) as { c: number };
  return row.c;
}
