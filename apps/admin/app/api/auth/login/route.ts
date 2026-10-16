import { NextResponse } from "next/server";
import { z } from "zod";

import { authenticateAdmin } from "@/lib/admin-users";
import { setSessionCookie } from "@/lib/session";

const bodySchema = z.object({
  ventureKey: z.string().min(2).max(64),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  if (!process.env.MONGODB_URI?.trim() && !process.env.DATABASE_URL?.trim()) {
    return NextResponse.json({ error: "MongoDB is not configured (MONGODB_URI)." }, { status: 503 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid venture key, email, or password." }, { status: 400 });
  }

  try {
    const user = await authenticateAdmin(
      parsed.data.ventureKey,
      parsed.data.email,
      parsed.data.password,
    );
    if (!user) {
      return NextResponse.json({ error: "Invalid venture key, email, or password." }, { status: 401 });
    }

    await setSessionCookie(user.ventureKey, user._id.toString());
    return NextResponse.json({
      ok: true,
      email: user.email,
      ventureKey: user.ventureKey,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Login failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
