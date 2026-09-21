import { NextRequest, NextResponse } from "next/server";
import { createLead, findDuplicateLead, listLeads } from "@/lib/repo/leads";
import { addEvent } from "@/lib/repo/events";
import { getSession } from "@/lib/auth/session";
import type { Mode } from "@/lib/types";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  return NextResponse.json(await listLeads(session.userId));
}

// Cadastro manual de um lead (o formulário "Novo lead" na tela de Leads).
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const body = await req.json();
  if (!body?.name) {
    return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
  }

  const dup = await findDuplicateLead(session.userId, {
    whatsapp: body.whatsapp || null,
    phone: body.phone || null,
    instagram: body.instagram || null,
  });
  if (dup) {
    return NextResponse.json(
      { error: `Já existe um lead com esse contato: ${dup.name}.` },
      { status: 409 }
    );
  }

  const mode: Mode = body.mode === "MODO_2" ? "MODO_2" : "MODO_1";
  const lead = await createLead(session.userId, {
    name: body.name,
    phone: body.phone || null,
    whatsapp: body.whatsapp || null,
    instagram: body.instagram || null,
    source: body.source || null,
    mode,
  });
  await addEvent({
    leadId: lead.id,
    channel: "SISTEMA",
    direction: "SAIDA",
    content: "Lead cadastrado manualmente.",
  });

  return NextResponse.json(lead, { status: 201 });
}
