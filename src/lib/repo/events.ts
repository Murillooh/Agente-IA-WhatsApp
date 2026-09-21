import prisma from "@/lib/prisma";
import type { Channel, ConversationEvent, Direction } from "@/lib/types";

function rowToEvent(r: any): ConversationEvent {
  return {
    id: r.id,
    leadId: r.leadId,
    channel: r.channel,
    direction: r.direction,
    content: r.content,
    createdAt: r.createdAt.toISOString(),
  };
}

export async function listEventsForLead(leadId: string, userId: string): Promise<ConversationEvent[]> {
  const rows = await prisma.conversationEvent.findMany({
    where: {
      leadId,
      lead: { userId }, // ensures the user owns the lead
    },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(rowToEvent);
}

export async function listRecentEvents(
  userId: string,
  limit = 8
): Promise<(ConversationEvent & { leadName: string })[]> {
  const rows = await prisma.conversationEvent.findMany({
    where: {
      lead: { userId },
    },
    include: {
      lead: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map((r: any) => ({ ...rowToEvent(r), leadName: r.lead.name }));
}

// Sem userId aqui de propósito: quem chama já verificou a posse do lead
// (via getLead(id, userId)) antes de registrar o evento.
export async function addEvent(input: {
  leadId: string;
  channel: Channel;
  direction: Direction;
  content: string;
  scriptId?: string | null;
}): Promise<ConversationEvent> {
  const row = await prisma.conversationEvent.create({
    data: {
      leadId: input.leadId,
      channel: input.channel,
      direction: input.direction,
      content: input.content,
      scriptId: input.scriptId || null,
    },
  });
  return rowToEvent(row);
}
