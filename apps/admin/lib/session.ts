import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "vensai_admin_session";

function secret(): string {
  const s = process.env.SESSION_SECRET?.trim() || process.env.VENTURE_PROVISIONING_SECRET?.trim();
  if (!s) throw new Error("SESSION_SECRET or VENTURE_PROVISIONING_SECRET must be set.");
  return s;
}

export function signSession(ventureKey: string, userId: string, maxAgeSec = 60 * 60 * 24 * 7): string {
  const exp = Math.floor(Date.now() / 1000) + maxAgeSec;
  const payload = `${ventureKey}.${userId}.${exp}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifySessionToken(
  token: string | undefined,
): { ventureKey: string; userId: string } | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const [ventureKey, userId, expStr, sig] = parts;
  const exp = Number(expStr);
  if (!ventureKey || !userId || !Number.isFinite(exp) || !sig) return null;
  if (exp < Math.floor(Date.now() / 1000)) return null;
  const payload = `${ventureKey}.${userId}.${expStr}`;
  const expected = createHmac("sha256", secret()).update(payload).digest("hex");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  return { ventureKey, userId };
}

export async function getSession(): Promise<{ ventureKey: string; userId: string } | null> {
  const jar = await cookies();
  return verifySessionToken(jar.get(COOKIE)?.value);
}

export async function setSessionCookie(ventureKey: string, userId: string) {
  const jar = await cookies();
  jar.set(COOKIE, signSession(ventureKey, userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
