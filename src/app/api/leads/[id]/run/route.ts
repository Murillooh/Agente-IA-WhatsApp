import { NextRequest, NextResponse } from "next/server";
import { runAutomationForLead } from "@/lib/automation";

// Dispara a automação de prospecção (Modo 1 ou 2) para este lead:
// manda mensagem via WhatsApp/Instagram e, no Modo 2, também liga.
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const result = await runAutomationForLead(id);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
