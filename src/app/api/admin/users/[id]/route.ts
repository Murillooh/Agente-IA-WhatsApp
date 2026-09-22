import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isUserAdmin } from "@/lib/repo/users";
import prisma from "@/lib/prisma";
import { logAudit } from "@/lib/repo/audit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const adminUser = await isUserAdmin(session.userId);
  if (!adminUser) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const { isApproved, isAdmin } = body;
  
  // Impede de alterar a si mesmo se for tirar o admin (opcional, para evitar travar a conta)
  if (id === session.userId && isAdmin === false) {
    return NextResponse.json({ error: "Você não pode remover seu próprio acesso de administrador." }, { status: 400 });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(isApproved !== undefined && { isApproved }),
        ...(isAdmin !== undefined && { isAdmin }),
      },
    });

    await logAudit(
      session.userId,
      "user.permissions_change",
      `Atualizou permissões de ${updatedUser.username} (Admin: ${updatedUser.isAdmin}, Aprovado: ${updatedUser.isApproved})`
    );

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json({ error: "Erro ao atualizar usuário." }, { status: 500 });
  }
}
