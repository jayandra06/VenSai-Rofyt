import { NextResponse } from "next/server";

import { getSession } from "@/lib/session";

export async function requireApiSession() {
  const session = await getSession();
  if (!session) {
    return { session: null as null, error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) };
  }
  return { session, error: null as null };
}
