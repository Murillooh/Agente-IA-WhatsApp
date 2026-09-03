import { NextRequest, NextResponse } from "next/server";
import { deleteLead, getLead, updateLead, updateLeadStatus } from "@/lib/repo/leads";
import { listEventsForLead } from "@/lib/repo/events";
import { getMeetingForLead } from "@/lib/repo/meetings";
import type { LeadStatus } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const lead = getLead(id);
  if (!lead) return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
  return NextResponse.json({
    lead,
    events: listEventsForLead(id),
    meeting: getMeetingForLead(id),
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  if (body.status) {
    const lead = updateLeadStatus(id, body.status as LeadStatus);
    if (!lead) return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
    return NextResponse.json(lead);
  }

  const lead = updateLead(id, body);
  if (!lead) return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
  return NextResponse.json(lead);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  deleteLead(id);
  return NextResponse.json({ ok: true });
}
