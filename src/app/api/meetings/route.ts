import { NextResponse } from "next/server";
import { listMeetings } from "@/lib/repo/meetings";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  return NextResponse.json(await listMeetings(session.userId));
}
