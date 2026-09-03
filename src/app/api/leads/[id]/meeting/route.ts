import { NextRequest, NextResponse } from "next/server";
import { upsertMeeting, updateMeetingStatus } from "@/lib/repo/meetings";
import { updateLeadStatus } from "@/lib/repo/leads";
import { addEvent } from "@/lib/repo/events";

// Agenda ou reagenda a reunião do lead — o objetivo final do sistema.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  if (!body?.scheduledAt) {
    return NextResponse.json({ error: "scheduledAt é obrigatório." }, { status: 400 });
  }

  const meeting = upsertMeeting({
    leadId: id,
    scheduledAt: body.scheduledAt,
    notes: body.notes ?? null,
  });
  updateLeadStatus(id, "REUNIAO_AGENDADA");
  addEvent({
    leadId: id,
    channel: "SISTEMA",
    direction: "SAIDA",
    content: `Reunião agendada para ${new Date(body.scheduledAt).toLocaleString("pt-BR")}.`,
  });

  return NextResponse.json(meeting, { status: 201 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  if (!body?.status) {
    return NextResponse.json({ error: "status é obrigatório." }, { status: 400 });
  }
  const meeting = updateMeetingStatus(id, body.status);
  if (body.status === "REALIZADA") {
    updateLeadStatus(id, "FECHADO");
    addEvent({
      leadId: id,
      channel: "SISTEMA",
      direction: "SAIDA",
      content: "Reunião marcada como realizada. Lead fechado 🎉",
    });
  }
  if (body.status === "CANCELADA") {
    addEvent({
      leadId: id,
      channel: "SISTEMA",
      direction: "SAIDA",
      content: "Reunião cancelada.",
    });
  }
  return NextResponse.json(meeting);
}
