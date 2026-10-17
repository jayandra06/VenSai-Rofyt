import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export type RofytApp = "admin" | "erp";

export type RofytSession = {
  app: RofytApp;
  email: string;
  orgCode: string;
  database: string;
  role: "platform_admin" | "org_admin";
  mustChangePassword: boolean;
};

function secret() {
  return process.env.AUTH_SECRET || "rofyt-dev-secret";
}

function cookieName(app: RofytApp) {
  return app === "admin" ? "rofyt_admin_session" : "rofyt_erp_session";
}

export function signSession(data: RofytSession) {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const body = Buffer.from(JSON.stringify({ ...data, exp })).toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function readSession(token?: string): (RofytSession & { exp: number }) | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString()) as RofytSession & { exp?: number };
    if (
      !data.email ||
      !data.orgCode ||
      !data.database ||
      !data.app ||
      !data.role ||
      data.exp === undefined ||
      data.exp < Date.now()
    ) {
      return null;
    }
    return { ...data, exp: data.exp };
  } catch {
    return null;
  }
}

export async function getSession(app: RofytApp) {
  const jar = await cookies();
  const raw = readSession(jar.get(cookieName(app))?.value);
  if (!raw || raw.app !== app) return null;
  const { exp: _, ...session } = raw;
  return session;
}

export async function setSession(session: RofytSession) {
  const jar = await cookies();
  const path = session.app === "admin" ? "/admin" : "/erp";
  jar.set(cookieName(session.app), signSession(session), {
    httpOnly: true,
    sameSite: "lax",
    path,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession(app: RofytApp) {
  const jar = await cookies();
  jar.delete(cookieName(app));
}
