import { NextRequest, NextResponse } from "next/server";
import { createLead, listLeads } from "@/lib/repo/leads";
import { addEvent } from "@/lib/repo/events";
import type { Mode } from "@/lib/types";

export async function GET() {
  return NextResponse.json(listLeads());
}

// Cadastro manual de um lead (o formulário "Novo lead" na tela de Leads).
export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body?.name) {
    return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
  }

  const mode: Mode = body.mode === "MODO_2" ? "MODO_2" : "MODO_1";
  const lead = createLead({
    name: body.name,
    phone: body.phone || null,
    whatsapp: body.whatsapp || null,
    instagram: body.instagram || null,
    source: body.source || null,
    mode,
  });
  addEvent({
    leadId: lead.id,
    channel: "SISTEMA",
    direction: "SAIDA",
    content: "Lead cadastrado manualmente.",
  });

  return NextResponse.json(lead, { status: 201 });
}
