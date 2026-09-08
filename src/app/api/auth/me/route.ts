import { NextRequest, NextResponse } from "next/server";
import { getUserById, getUserByIdWithHash, updatePasswordHash } from "@/lib/repo/users";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const user = getUserById(session.userId);
  if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  return NextResponse.json(user);
}

// Troca a própria senha — pede a senha atual pra confirmar.
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "Senha atual e nova senha são obrigatórias." },
      { status: 400 }
    );
  }
  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "A nova senha precisa ter pelo menos 8 caracteres." },
      { status: 400 }
    );
  }

  const user = getUserByIdWithHash(session.userId);
  if (!user || !verifyPassword(currentPassword, user.passwordHash)) {
    return NextResponse.json({ error: "Senha atual incorreta." }, { status: 401 });
  }

  updatePasswordHash(session.userId, hashPassword(newPassword));
  return NextResponse.json({ ok: true });
}
