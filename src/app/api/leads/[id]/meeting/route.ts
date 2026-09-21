import { NextRequest, NextResponse } from "next/server";
import { upsertMeeting, updateMeetingStatus } from "@/lib/repo/meetings";
import { updateLeadStatus } from "@/lib/repo/leads";
import { addEvent } from "@/lib/repo/events";
import { getSession } from "@/lib/auth/session";

// Agenda ou reagenda a reunião do lead — o objetivo final do sistema.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  if (!body?.scheduledAt) {
    return NextResponse.json({ error: "scheduledAt é obrigatório." }, { status: 400 });
  }

  const meeting = await upsertMeeting(session.userId, {
    leadId: id,
    scheduledAt: body.scheduledAt,
    notes: body.notes ?? null,
  });
  if (!meeting) {
    return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
  }
  await updateLeadStatus(id, session.userId, "REUNIAO_AGENDADA");
  await addEvent({
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
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  if (!body?.status) {
    return NextResponse.json({ error: "status é obrigatório." }, { status: 400 });
  }
  const meeting = await updateMeetingStatus(id, session.userId, body.status);
  if (!meeting) {
    return NextResponse.json({ error: "Reunião não encontrada." }, { status: 404 });
  }
  if (body.status === "REALIZADA") {
    await updateLeadStatus(id, session.userId, "FECHADO");
    await addEvent({
      leadId: id,
      channel: "SISTEMA",
      direction: "SAIDA",
      content: "Reunião marcada como realizada. Lead fechado 🎉",
    });
  }
  if (body.status === "CANCELADA") {
    await addEvent({
      leadId: id,
      channel: "SISTEMA",
      direction: "SAIDA",
      content: "Reunião cancelada.",
    });
  }
  return NextResponse.json(meeting);
}
