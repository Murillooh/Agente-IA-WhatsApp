import prisma from "@/lib/prisma";

export interface User {
  id: string;
  username: string;
  name: string;
  isAdmin: boolean;
  createdAt: string;
}

function rowToUser(row: any): User {
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    isAdmin: row.isAdmin,
    createdAt: row.createdAt.toISOString(),
  };
}

/** Só pra gate de tela/rota de admin — não devolver isAdmin de outra conta pro cliente sem necessidade. */
export async function isUserAdmin(id: string): Promise<boolean> {
  const row = await prisma.user.findUnique({
    where: { id },
    select: { isAdmin: true },
  });
  return row?.isAdmin === true;
}

/** Lista todas as contas — usado só na tela de administração (gate por isUserAdmin no chamador). */
export async function listUsers(): Promise<User[]> {
  const rows = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
  });
  return rows.map(rowToUser);
}

/** Inclui o hash da senha — só pra uso interno do fluxo de login, nunca devolver isso pro cliente. */
export async function findUserByUsernameWithHash(
  username: string
): Promise<(User & { passwordHash: string }) | null> {
  const row = await prisma.user.findUnique({
    where: { username },
  });
  if (!row) return null;
  return { ...rowToUser(row), passwordHash: row.passwordHash };
}

export async function getUserById(id: string): Promise<User | null> {
  const row = await prisma.user.findUnique({
    where: { id },
  });
  return row ? rowToUser(row) : null;
}

/** Mesmo cuidado de findUserByUsernameWithHash — hash é só pra conferir a senha atual. */
export async function getUserByIdWithHash(id: string): Promise<(User & { passwordHash: string }) | null> {
  const row = await prisma.user.findUnique({
    where: { id },
  });
  if (!row) return null;
  return { ...rowToUser(row), passwordHash: row.passwordHash };
}

export async function updatePasswordHash(id: string, passwordHash: string): Promise<void> {
  await prisma.user.update({
    where: { id },
    data: { passwordHash },
  });
}

export async function createUser(input: { username: string; name: string; passwordHash: string }): Promise<User> {
  const row = await prisma.user.create({
    data: {
      username: input.username,
      name: input.name,
      passwordHash: input.passwordHash,
    },
  });
  return rowToUser(row);
}
