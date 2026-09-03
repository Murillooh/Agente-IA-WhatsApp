import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import type { Channel, ConversationEvent, Direction } from "@/lib/types";

interface EventRow {
  id: string;
  lead_id: string;
  channel: Channel;
  direction: Direction;
  content: string;
  created_at: string;
}

function rowToEvent(r: EventRow): ConversationEvent {
  return {
    id: r.id,
    leadId: r.lead_id,
    channel: r.channel,
    direction: r.direction,
    content: r.content,
    createdAt: r.created_at,
  };
}

export function listEventsForLead(leadId: string): ConversationEvent[] {
  const rows = db
    .prepare(
      "SELECT * FROM conversation_events WHERE lead_id = ? ORDER BY created_at ASC"
    )
    .all(leadId) as EventRow[];
  return rows.map(rowToEvent);
}

export function listRecentEvents(
  limit = 8
): (ConversationEvent & { leadName: string })[] {
  const rows = db
    .prepare(
      `SELECT e.*, l.name as lead_name FROM conversation_events e
       JOIN leads l ON l.id = e.lead_id
       ORDER BY e.created_at DESC
       LIMIT ?`
    )
    .all(limit) as (EventRow & { lead_name: string })[];
  return rows.map((r) => ({ ...rowToEvent(r), leadName: r.lead_name }));
}

export function addEvent(input: {
  leadId: string;
  channel: Channel;
  direction: Direction;
  content: string;
}): ConversationEvent {
  const id = randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO conversation_events (id, lead_id, channel, direction, content, created_at)
     VALUES (@id, @leadId, @channel, @direction, @content, @now)`
  ).run({ id, ...input, now });
  const row = db
    .prepare("SELECT * FROM conversation_events WHERE id = ?")
    .get(id) as EventRow;
  return rowToEvent(row);
}
