import { NextRequest, NextResponse } from "next/server";
import { deleteLead, getLead, updateLead, updateLeadStatus } from "@/lib/repo/leads";
import { listEventsForLead } from "@/lib/repo/events";
import { getMeetingForLead } from "@/lib/repo/meetings";
import { getSession } from "@/lib/auth/session";
import type { LeadStatus } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const lead = getLead(id, session.userId);
  if (!lead) return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
  return NextResponse.json({
    lead,
    events: listEventsForLead(id, session.userId),
    meeting: getMeetingForLead(id, session.userId),
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  if (body.status) {
    const lead = updateLeadStatus(id, session.userId, body.status as LeadStatus);
    if (!lead) return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
    return NextResponse.json(lead);
  }

  const lead = updateLead(id, session.userId, body);
  if (!lead) return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
  return NextResponse.json(lead);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  deleteLead(id, session.userId);
  return NextResponse.json({ ok: true });
}
