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

export function getMeetingForLead(leadId: string): Meeting | null {
  const row = db
    .prepare("SELECT * FROM meetings WHERE lead_id = ?")
    .get(leadId) as MeetingRow | undefined;
  return row ? rowToMeeting(row) : null;
}

export function listMeetings(): (Meeting & { leadName: string })[] {
  const rows = db
    .prepare(
      `SELECT m.*, l.name as lead_name FROM meetings m
       JOIN leads l ON l.id = m.lead_id
       ORDER BY m.scheduled_at ASC`
    )
    .all() as (MeetingRow & { lead_name: string })[];
  return rows.map((r) => ({ ...rowToMeeting(r), leadName: r.lead_name }));
}

export function upsertMeeting(input: {
  leadId: string;
  scheduledAt: string;
  notes?: string | null;
}): Meeting {
  const existing = getMeetingForLead(input.leadId);
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
  return getMeetingForLead(input.leadId)!;
}

export function updateMeetingStatus(
  leadId: string,
  status: MeetingStatus
): Meeting | null {
  const now = new Date().toISOString();
  db.prepare(
    "UPDATE meetings SET status = ?, updated_at = ? WHERE lead_id = ?"
  ).run(status, now, leadId);
  return getMeetingForLead(leadId);
}

export function countUpcomingMeetings(): number {
  const row = db
    .prepare(
      "SELECT COUNT(*) as c FROM meetings WHERE status = 'AGENDADA' AND scheduled_at >= datetime('now')"
    )
    .get() as { c: number };
  return row.c;
}
