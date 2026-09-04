import { NextRequest, NextResponse } from "next/server";
import { createUser, findUserByUsernameWithHash } from "@/lib/repo/users";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!name || !username || !password) {
    return NextResponse.json(
      { error: "Nome, usuário e senha são obrigatórios." },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "A senha precisa ter pelo menos 8 caracteres." },
      { status: 400 }
    );
  }
  if (findUserByUsernameWithHash(username)) {
    return NextResponse.json({ error: "Já existe uma conta com esse usuário." }, { status: 409 });
  }

  const user = createUser({ username, name, passwordHash: hashPassword(password) });
  await createSession(user.id);
  return NextResponse.json(user, { status: 201 });
}
