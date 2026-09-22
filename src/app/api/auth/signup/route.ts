import { NextRequest, NextResponse } from "next/server";
import { createUser, findUserByUsernameWithHash } from "@/lib/repo/users";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

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
  if (await findUserByUsernameWithHash(username)) {
    return NextResponse.json({ error: "Já existe uma conta com esse usuário." }, { status: 409 });
  }

  // Se for o primeiro usuário a se cadastrar, aprova e dá admin automaticamente
  const userCount = await prisma.user.count();
  const isFirstUser = userCount === 0;

  const user = await createUser({ 
    username, 
    name, 
    passwordHash: hashPassword(password),
    isApproved: isFirstUser,
    isAdmin: isFirstUser
  });
  if (isFirstUser) {
    await createSession(user.id);
    return NextResponse.json(user, { status: 201 });
  }

  // Se não foi auto-aprovado, não loga e avisa o front
  return NextResponse.json(
    { message: "Conta criada com sucesso! Aguarde a aprovação de um administrador." }, 
    { status: 201 }
  );
}
