import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import type { Lead, LeadStatus, Mode } from "@/lib/types";

function rowToLead(r: any): Lead {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone,
    whatsapp: r.whatsapp,
    instagram: r.instagram,
    source: r.source,
    mode: r.mode,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export interface DateRange {
  from?: string;
  to?: string;
}

function dateRangeQuery(range?: DateRange) {
  if (!range) return {};
  const query: any = {};
  if (range.from) query.gte = new Date(range.from);
  if (range.to) query.lte = new Date(range.to);
  return query;
}

export async function listLeads(userId: string, range?: DateRange): Promise<Lead[]> {
  const rows = await prisma.lead.findMany({
    where: {
      userId,
      ...(range ? { createdAt: dateRangeQuery(range) } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(rowToLead);
}

export async function getLead(id: string, userId: string): Promise<Lead | null> {
  const row = await prisma.lead.findFirst({
    where: { id, userId }, // userId ensures they own it
  });
  return row ? rowToLead(row) : null;
}

export async function createLead(
  userId: string,
  input: {
    name: string;
    phone?: string | null;
    whatsapp?: string | null;
    instagram?: string | null;
    source?: string | null;
    mode: Mode;
  }
): Promise<Lead> {
  const row = await prisma.lead.create({
    data: {
      userId,
      name: input.name,
      phone: input.phone || null,
      whatsapp: input.whatsapp || null,
      instagram: input.instagram || null,
      source: input.source || null,
      mode: input.mode,
      status: "NOVO",
    },
  });
  return rowToLead(row);
}

export async function updateLeadStatus(
  id: string,
  userId: string,
  status: LeadStatus
): Promise<Lead | null> {
  try {
    const row = await prisma.lead.updateMany({
      where: { id, userId },
      data: { status },
    });
    if (row.count === 0) return null;
    return await getLead(id, userId);
  } catch {
    return null;
  }
}

export async function updateLead(
  id: string,
  userId: string,
  input: Partial<Pick<Lead, "name" | "phone" | "whatsapp" | "instagram" | "source" | "mode">>
): Promise<Lead | null> {
  const current = await getLead(id, userId);
  if (!current) return null;
  
  await prisma.lead.updateMany({
    where: { id, userId },
    data: {
      name: input.name ?? current.name,
      phone: input.phone !== undefined ? input.phone : current.phone,
      whatsapp: input.whatsapp !== undefined ? input.whatsapp : current.whatsapp,
      instagram: input.instagram !== undefined ? input.instagram : current.instagram,
      source: input.source !== undefined ? input.source : current.source,
      mode: input.mode ?? current.mode,
    },
  });
  return await getLead(id, userId);
}

export async function deleteLead(id: string, userId: string): Promise<void> {
  await prisma.lead.deleteMany({
    where: { id, userId },
  });
}

function normalizePhone(v: string | null | undefined): string | null {
  if (!v) return null;
  const digits = v.replace(/\D/g, "");
  return digits || null;
}

function normalizeInstagram(v: string | null | undefined): string | null {
  if (!v) return null;
  const t = v.trim().replace(/^@/, "").toLowerCase();
  return t || null;
}

export async function findDuplicateLead(
  userId: string,
  input: { whatsapp?: string | null; phone?: string | null; instagram?: string | null }
): Promise<Lead | null> {
  const phoneCandidates = [normalizePhone(input.whatsapp), normalizePhone(input.phone)].filter(
    (v): v is string => v !== null
  );
  const ig = normalizeInstagram(input.instagram);
  if (phoneCandidates.length === 0 && !ig) return null;

  const leads = await listLeads(userId);
  for (const lead of leads) {
    if (ig && normalizeInstagram(lead.instagram) === ig) return lead;
    if (phoneCandidates.length > 0) {
      const leadPhones = [normalizePhone(lead.whatsapp), normalizePhone(lead.phone)].filter(
        (v): v is string => v !== null
      );
      if (leadPhones.some((lp) => phoneCandidates.includes(lp))) return lead;
    }
  }
  return null;
}

export async function findLeadByPhoneGlobal(phone: string): Promise<Lead | null> {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;

  // We search globally, without userId context, because webhooks arrive without it
  const rows = await prisma.lead.findMany();
  for (const lead of rows) {
    if (normalizePhone(lead.whatsapp) === normalized || normalizePhone(lead.phone) === normalized) {
      return rowToLead(lead);
    }
  }
  return null;
}

export async function updateLeadStatusGlobal(id: string, status: LeadStatus): Promise<void> {
  await prisma.lead.update({
    where: { id },
    data: { status },
  });
}

export async function countLeadsByStatus(userId: string, range?: DateRange): Promise<Record<LeadStatus, number>> {
  const result = await prisma.lead.groupBy({
    by: ["status"],
    where: {
      userId,
      ...(range ? { createdAt: dateRangeQuery(range) } : {}),
    },
    _count: true,
  });

  const base: Record<LeadStatus, number> = {
    NOVO: 0,
    CONTATADO: 0,
    RESPONDENDO: 0,
    REUNIAO_AGENDADA: 0,
    FECHADO: 0,
    PERDIDO: 0,
  };
  for (const r of result) base[r.status as LeadStatus] = r._count;
  return base;
}

export async function countLeadsByMode(userId: string, range?: DateRange): Promise<Record<Mode, number>> {
  const result = await prisma.lead.groupBy({
    by: ["mode"],
    where: {
      userId,
      ...(range ? { createdAt: dateRangeQuery(range) } : {}),
    },
    _count: true,
  });

  const base: Record<Mode, number> = { MODO_1: 0, MODO_2: 0 };
  for (const r of result) base[r.mode as Mode] = r._count;
  return base;
}

export async function averageDaysToClose(userId: string, range?: DateRange): Promise<number | null> {
  const rows = (await prisma.$queryRaw`
    SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400) as avg_days
    FROM leads
    WHERE user_id = ${userId} AND status = 'FECHADO'
    ${range?.from ? Prisma.sql`AND created_at >= ${new Date(range.from)}` : Prisma.empty}
    ${range?.to ? Prisma.sql`AND created_at <= ${new Date(range.to)}` : Prisma.empty}
  `) as any[];
  return rows[0]?.avg_days ? Number(rows[0].avg_days) : null;
}

export interface SourceConversion {
  source: string;
  total: number;
  closed: number;
}

export async function conversionBySource(userId: string, range?: DateRange): Promise<SourceConversion[]> {
  const rows = (await prisma.$queryRaw`
    SELECT COALESCE(source, 'Sem origem') as source,
           COUNT(*) as total,
           SUM(CASE WHEN status = 'FECHADO' THEN 1 ELSE 0 END) as closed
    FROM leads 
    WHERE user_id = ${userId}
    ${range?.from ? Prisma.sql`AND created_at >= ${new Date(range.from)}` : Prisma.empty}
    ${range?.to ? Prisma.sql`AND created_at <= ${new Date(range.to)}` : Prisma.empty}
    GROUP BY COALESCE(source, 'Sem origem') 
    ORDER BY total DESC
  `) as any[];
  return rows.map((r: any) => ({
    source: r.source,
    total: Number(r.total),
    closed: Number(r.closed),
  }));
}
