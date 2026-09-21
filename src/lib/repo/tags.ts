import prisma from "@/lib/prisma";
import type { LeadTag } from "@/lib/types";

function rowToTag(r: any): LeadTag {
  return { id: r.id, leadId: r.leadId, label: r.label, createdAt: r.createdAt.toISOString() };
}

export async function listTagsForLead(leadId: string, userId: string): Promise<LeadTag[]> {
  const ownsLead = await prisma.lead.findFirst({
    where: { id: leadId, userId },
  });
  if (!ownsLead) return [];
  
  const rows = await prisma.leadTag.findMany({
    where: { leadId },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(rowToTag);
}

export async function addTag(leadId: string, userId: string, label: string): Promise<LeadTag | null> {
  const ownsLead = await prisma.lead.findFirst({
    where: { id: leadId, userId },
  });
  if (!ownsLead) return null;
  
  const clean = label.trim();
  if (!clean) return null;

  try {
    const row = await prisma.leadTag.create({
      data: {
        leadId,
        label: clean,
      },
    });
    return rowToTag(row);
  } catch {
    const existing = await prisma.leadTag.findUnique({
      where: { leadId_label: { leadId, label: clean } },
    });
    return existing ? rowToTag(existing) : null;
  }
}

export async function removeTag(tagId: string, leadId: string, userId: string): Promise<void> {
  const ownsLead = await prisma.lead.findFirst({
    where: { id: leadId, userId },
  });
  if (!ownsLead) return;
  
  await prisma.leadTag.deleteMany({
    where: { id: tagId, leadId },
  });
}
