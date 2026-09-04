import { NextRequest, NextResponse } from "next/server";
import { runAutomationForLead } from "@/lib/automation";
import { getSession } from "@/lib/auth/session";

// Dispara a automação de prospecção (Modo 1 ou 2) para este lead:
// manda mensagem via WhatsApp/Instagram e, no Modo 2, também liga.
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  try {
    const result = await runAutomationForLead(id, session.userId);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
