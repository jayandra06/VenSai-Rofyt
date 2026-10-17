import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

export function verifyPassword(password: string, salt: string, hash: string) {
  const derived = scryptSync(password, salt, 32);
  const expected = Buffer.from(hash, "hex");
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const passwordHash = scryptSync(password, salt, 32).toString("hex");
  return { passwordHash, passwordSalt: salt, passwordAlgo: "scrypt" as const };
}
