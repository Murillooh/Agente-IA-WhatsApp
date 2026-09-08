import { randomUUID } from "crypto";
import { db } from "@/lib/db";

export interface User {
  id: string;
  username: string;
  name: string;
  createdAt: string;
}

interface UserRow {
  id: string;
  username: string;
  name: string;
  password_hash: string;
  created_at: string;
}

function rowToUser(r: UserRow): User {
  return { id: r.id, username: r.username, name: r.name, createdAt: r.created_at };
}

/** Inclui o hash da senha — só pra uso interno do fluxo de login, nunca devolver isso pro cliente. */
export function findUserByUsernameWithHash(
  username: string
): (User & { passwordHash: string }) | null {
  const row = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as
    | UserRow
    | undefined;
  if (!row) return null;
  return { ...rowToUser(row), passwordHash: row.password_hash };
}

export function getUserById(id: string): User | null {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
  return row ? rowToUser(row) : null;
}

/** Mesmo cuidado de findUserByUsernameWithHash — hash é só pra conferir a senha atual. */
export function getUserByIdWithHash(id: string): (User & { passwordHash: string }) | null {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
  if (!row) return null;
  return { ...rowToUser(row), passwordHash: row.password_hash };
}

export function updatePasswordHash(id: string, passwordHash: string): void {
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(passwordHash, id);
}

export function createUser(input: { username: string; name: string; passwordHash: string }): User {
  const id = randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO users (id, username, name, password_hash, created_at)
     VALUES (@id, @username, @name, @password_hash, @now)`
  ).run({
    id,
    username: input.username,
    name: input.name,
    password_hash: input.passwordHash,
    now,
  });
  return { id, username: input.username, name: input.name, createdAt: now };
}
