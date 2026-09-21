import prisma from "@/lib/prisma";
import type { Meeting, MeetingStatus } from "@/lib/types";

function rowToMeeting(r: any): Meeting {
  return {
    id: r.id,
    leadId: r.leadId,
    scheduledAt: r.scheduledAt.toISOString(),
    status: r.status,
    notes: r.notes,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export async function getMeetingForLead(leadId: string, userId: string): Promise<Meeting | null> {
  const row = await prisma.meeting.findFirst({
    where: {
      leadId,
      lead: { userId },
    },
  });
  return row ? rowToMeeting(row) : null;
}

export async function listMeetings(userId: string): Promise<(Meeting & { leadName: string })[]> {
  const rows = await prisma.meeting.findMany({
    where: {
      lead: { userId },
    },
    include: {
      lead: { select: { name: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });
  return rows.map((r: any) => ({ ...rowToMeeting(r), leadName: r.lead.name }));
}

export async function upsertMeeting(
  userId: string,
  input: { leadId: string; scheduledAt: string; notes?: string | null }
): Promise<Meeting | null> {
  const ownsLead = await prisma.lead.findFirst({
    where: { id: input.leadId, userId },
  });
  if (!ownsLead) return null;

  const row = await prisma.meeting.upsert({
    where: { leadId: input.leadId },
    update: {
      scheduledAt: new Date(input.scheduledAt),
      notes: input.notes ?? null,
      status: "AGENDADA",
    },
    create: {
      leadId: input.leadId,
      scheduledAt: new Date(input.scheduledAt),
      notes: input.notes ?? null,
      status: "AGENDADA",
    },
  });
  return rowToMeeting(row);
}

export async function updateMeetingStatus(
  leadId: string,
  userId: string,
  status: MeetingStatus
): Promise<Meeting | null> {
  const ownsLead = await prisma.lead.findFirst({
    where: { id: leadId, userId },
  });
  if (!ownsLead) return null;

  const row = await prisma.meeting.update({
    where: { leadId },
    data: { status },
  });
  return rowToMeeting(row);
}

export async function countUpcomingMeetings(userId: string): Promise<number> {
  const count = await prisma.meeting.count({
    where: {
      status: "AGENDADA",
      scheduledAt: { gte: new Date() },
      lead: { userId },
    },
  });
  return count;
}
