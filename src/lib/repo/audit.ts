import prisma from "@/lib/prisma";

export interface AuditEntry {
  id: string;
  userId: string | null;
  userName: string | null;
  action: string;
  detail: string | null;
  createdAt: string;
}

export async function logAudit(userId: string, action: string, detail?: string): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      detail: detail ?? null,
    },
  });
}

export async function listAuditLog(limit = 200): Promise<AuditEntry[]> {
  const rows = await prisma.auditLog.findMany({
    include: {
      user: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return rows.map((r: any) => ({
    id: r.id,
    userId: r.userId,
    userName: r.user?.name ?? null,
    action: r.action,
    detail: r.detail,
    createdAt: r.createdAt.toISOString(),
  }));
}
