import { cookies } from "next/headers";
import { encodeSession, decodeSession, SESSION_COOKIE, SESSION_MAX_AGE } from "./token";

// Só usar isto em Route Handlers / Server Actions / Server Components
// (é onde next/headers funciona). O src/proxy.ts lê o cookie direto de
// request.cookies e usa token.ts sozinho, sem passar por aqui.

export async function createSession(userId: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, encodeSession(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function deleteSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession() {
  const store = await cookies();
  return decodeSession(store.get(SESSION_COOKIE)?.value);
}
