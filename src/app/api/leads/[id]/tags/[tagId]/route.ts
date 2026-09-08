import { NextRequest, NextResponse } from "next/server";
import { removeTag } from "@/lib/repo/tags";
import { getSession } from "@/lib/auth/session";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; tagId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id, tagId } = await params;
  removeTag(tagId, id, session.userId);
  return NextResponse.json({ ok: true });
}
