import prisma from "@/lib/prisma";
import type { Channel, Mode, SalesScript } from "@/lib/types";

function rowToScript(r: any): SalesScript {
  return {
    id: r.id,
    groupId: r.groupId,
    version: r.version,
    name: r.name,
    mode: r.mode,
    channel: r.channel,
    content: r.content,
    weight: r.weight,
    isActive: !!r.isActive,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export async function getRow(id: string) {
  return await prisma.script.findUnique({ where: { id } });
}

export async function listScripts(): Promise<SalesScript[]> {
  const rows = await prisma.script.findMany({
    orderBy: [
      { mode: "asc" },
      { channel: "asc" },
      { version: "desc" },
    ],
  });
  return rows.map(rowToScript);
}

export async function getActiveScript(mode: Mode, channel: Channel): Promise<SalesScript | null> {
  const rows = await prisma.script.findMany({
    where: { mode, channel, isActive: true },
  });
  if (rows.length === 0) return null;
  if (rows.length === 1) return rowToScript(rows[0]);

  const totalWeight = rows.reduce((sum: number, r: any) => sum + Math.max(0, r.weight), 0);
  if (totalWeight <= 0) return rowToScript(rows[0]);

  let roll = Math.random() * totalWeight;
  for (const r of rows) {
    roll -= Math.max(0, r.weight);
    if (roll <= 0) return rowToScript(r);
  }
  return rowToScript(rows[rows.length - 1]);
}

export async function createScript(input: {
  name: string;
  mode: Mode;
  channel: Channel;
  content: string;
  weight?: number;
}): Promise<SalesScript> {
  const row = await prisma.script.create({
    data: {
      groupId: "", // will update right after
      version: 1,
      name: input.name,
      mode: input.mode,
      channel: input.channel,
      content: input.content,
      weight: input.weight ?? 100,
      isActive: true,
    },
  });
  
  // Set groupId = id
  const updated = await prisma.script.update({
    where: { id: row.id },
    data: { groupId: row.id },
  });

  return rowToScript(updated);
}

export async function editScriptContent(
  id: string,
  input: { name?: string; content: string; weight?: number }
): Promise<SalesScript | null> {
  const current = await getRow(id);
  if (!current) return null;

  const row = await prisma.script.create({
    data: {
      groupId: current.groupId,
      version: current.version + 1,
      name: input.name ?? current.name,
      mode: current.mode,
      channel: current.channel,
      content: input.content,
      weight: input.weight ?? current.weight,
      isActive: current.isActive,
    },
  });

  await prisma.script.update({
    where: { id },
    data: { isActive: false },
  });

  return rowToScript(row);
}

export async function patchScriptMeta(
  id: string,
  input: Partial<Pick<SalesScript, "name" | "isActive" | "weight">>
): Promise<SalesScript | null> {
  const current = await getRow(id);
  if (!current) return null;
  
  const updated = await prisma.script.update({
    where: { id },
    data: {
      name: input.name ?? current.name,
      weight: input.weight ?? current.weight,
      isActive: input.isActive === undefined ? current.isActive : input.isActive,
    },
  });
  return rowToScript(updated);
}

export async function deleteScript(id: string): Promise<void> {
  await prisma.script.delete({ where: { id } });
}

export interface ScriptStats {
  sent: number;
  closed: number;
}

export async function scriptStats(scriptId: string): Promise<ScriptStats> {
  const sentCount = await prisma.conversationEvent.count({
    where: { scriptId },
  });
  const closedEvents = await prisma.conversationEvent.findMany({
    where: {
      scriptId,
      lead: { status: "FECHADO" },
    },
    select: { leadId: true },
    distinct: ["leadId"],
  });

  return {
    sent: sentCount,
    closed: closedEvents.length,
  };
}
