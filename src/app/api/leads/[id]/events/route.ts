import { NextRequest, NextResponse } from "next/server";
import { addEvent, listEventsForLead } from "@/lib/repo/events";
import { getLead } from "@/lib/repo/leads";
import { getSession } from "@/lib/auth/session";
import type { Channel, Direction } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  return NextResponse.json(listEventsForLead(id, session.userId));
}

// Permite registrar manualmente uma resposta do lead ou uma nota
// (ex: você respondeu por fora, ou quer anotar algo na timeline/esboço).
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  if (!getLead(id, session.userId)) {
    return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
  }

  const body = await req.json();
  if (!body?.content) {
    return NextResponse.json({ error: "Conteúdo é obrigatório." }, { status: 400 });
  }
  const event = addEvent({
    leadId: id,
    channel: (body.channel as Channel) ?? "SISTEMA",
    direction: (body.direction as Direction) ?? "ENTRADA",
    content: body.content,
  });
  return NextResponse.json(event, { status: 201 });
}
