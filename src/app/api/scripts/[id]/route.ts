import { NextRequest, NextResponse } from "next/server";
import { deleteScript, editScriptContent, patchScriptMeta } from "@/lib/repo/scripts";

// Conteúdo mudou -> gera versão nova (histórico preservado). Só
// nome/ativo/peso -> ajuste no lugar, sem versionar.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const script =
    typeof body.content === "string"
      ? await editScriptContent(id, body)
      : await patchScriptMeta(id, body);

  if (!script) return NextResponse.json({ error: "Script não encontrado." }, { status: 404 });
  return NextResponse.json(script);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await deleteScript(id);
  return NextResponse.json({ ok: true });
}
