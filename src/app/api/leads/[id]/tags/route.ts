import { NextRequest, NextResponse } from "next/server";
import { addTag, listTagsForLead } from "@/lib/repo/tags";
import { getLead } from "@/lib/repo/leads";
import { getSession } from "@/lib/auth/session";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  if (!(await getLead(id, session.userId))) {
    return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
  }
  return NextResponse.json(await listTagsForLead(id, session.userId));
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const label = typeof body?.label === "string" ? body.label : "";
  if (!label.trim()) {
    return NextResponse.json({ error: "Tag não pode ser vazia." }, { status: 400 });
  }

  const tag = await addTag(id, session.userId, label);
  if (!tag) return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
  return NextResponse.json(tag, { status: 201 });
}
