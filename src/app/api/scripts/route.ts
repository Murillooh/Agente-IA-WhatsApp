import { NextRequest, NextResponse } from "next/server";
import { createScript, listScripts } from "@/lib/repo/scripts";
import { getSession } from "@/lib/auth/session";
import { isUserAdmin } from "@/lib/repo/users";

export async function GET() {
  const session = await getSession();
  if (!session || !(await isUserAdmin(session.userId))) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }
  return NextResponse.json(await listScripts());
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !(await isUserAdmin(session.userId))) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }
  const body = await req.json();
  if (!body?.name || !body?.mode || !body?.channel || !body?.content) {
    return NextResponse.json(
      { error: "name, mode, channel e content são obrigatórios." },
      { status: 400 }
    );
  }
  const script = await createScript(body);
  return NextResponse.json(script, { status: 201 });
}
