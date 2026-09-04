import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

// Hash de senha com scrypt (nativo do Node, sem dependência nova tipo
// bcrypt). Formato salvo: "salt_em_hex:hash_em_hex".
const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;

  const hashBuffer = Buffer.from(hash, "hex");
  const derivedBuffer = scryptSync(password, salt, KEY_LENGTH);

  // timingSafeEqual exige buffers do mesmo tamanho — se não bater, já é
  // hash inválido (mas não pode comparar direto sem checar antes, senão
  // lança exceção em vez de devolver false).
  if (hashBuffer.length !== derivedBuffer.length) return false;
  return timingSafeEqual(hashBuffer, derivedBuffer);
}
