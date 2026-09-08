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

// Assim como reuniões, eventos não têm dono próprio — passa pelo JOIN em
// leads.user_id.

export function listEventsForLead(leadId: string, userId: string): ConversationEvent[] {
  const rows = db
    .prepare(
      `SELECT e.* FROM conversation_events e
       JOIN leads l ON l.id = e.lead_id
       WHERE e.lead_id = ? AND l.user_id = ?
       ORDER BY e.created_at ASC`
    )
    .all(leadId, userId) as EventRow[];
  return rows.map(rowToEvent);
}

export function listRecentEvents(
  userId: string,
  limit = 8
): (ConversationEvent & { leadName: string })[] {
  const rows = db
    .prepare(
      `SELECT e.*, l.name as lead_name FROM conversation_events e
       JOIN leads l ON l.id = e.lead_id
       WHERE l.user_id = ?
       ORDER BY e.created_at DESC
       LIMIT ?`
    )
    .all(userId, limit) as (EventRow & { lead_name: string })[];
  return rows.map((r) => ({ ...rowToEvent(r), leadName: r.lead_name }));
}

// Sem userId aqui de propósito: quem chama já verificou a posse do lead
// (via getLead(id, userId)) antes de registrar o evento.
export function addEvent(input: {
  leadId: string;
  channel: Channel;
  direction: Direction;
  content: string;
  scriptId?: string | null;
}): ConversationEvent {
  const id = randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO conversation_events (id, lead_id, channel, direction, content, script_id, created_at)
     VALUES (@id, @leadId, @channel, @direction, @content, @scriptId, @now)`
  ).run({ ...input, id, scriptId: input.scriptId ?? null, now });
  const row = db
    .prepare("SELECT * FROM conversation_events WHERE id = ?")
    .get(id) as EventRow;
  return rowToEvent(row);
}
