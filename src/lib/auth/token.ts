import { createHmac, timingSafeEqual } from "crypto";

// Sessão sem lib nova: token = base64url(payload json) + "." + assinatura
// HMAC-SHA256 (crypto nativo do Node). Pura função, sem next/headers —
// dá pra importar tanto em src/proxy.ts (roda em runtime Node desde o
// Next 16) quanto no lado das rotas de API.
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 dias

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE = MAX_AGE_SECONDS;

export interface SessionPayload {
  userId: string;
  exp: number; // epoch seconds
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    // Evita quebrar em dev se esqueceu de configurar — mas isso NUNCA
    // deveria ir pra produção sem SESSION_SECRET de verdade no .env.
    return "dev-only-insecure-secret-troque-em-producao";
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function encodeSession(userId: string): string {
  const payload: SessionPayload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${payloadB64}.${sign(payloadB64)}`;
}

export function decodeSession(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;

  const expected = sign(payloadB64);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString()) as SessionPayload;
    if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
