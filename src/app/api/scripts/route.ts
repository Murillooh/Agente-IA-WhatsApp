import { NextRequest, NextResponse } from "next/server";
import { createScript, listScripts } from "@/lib/repo/scripts";

export async function GET() {
  return NextResponse.json(listScripts());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body?.name || !body?.mode || !body?.channel || !body?.content) {
    return NextResponse.json(
      { error: "name, mode, channel e content são obrigatórios." },
      { status: 400 }
    );
  }
  const script = createScript(body);
  return NextResponse.json(script, { status: 201 });
}
