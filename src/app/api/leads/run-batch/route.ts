import { NextRequest, NextResponse } from "next/server";
import { runAutomationBatch } from "@/lib/automation";

// Dispara a automação para VÁRIOS leads ao mesmo tempo (ex: "ligar para
// várias pessoas diferentes ao mesmo tempo"). Body: { leadIds: string[] }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const leadIds: string[] = Array.isArray(body?.leadIds) ? body.leadIds : [];
  if (leadIds.length === 0) {
    return NextResponse.json({ error: "Informe leadIds." }, { status: 400 });
  }
  const results = await runAutomationBatch(leadIds, 5);
  return NextResponse.json({ results });
}
