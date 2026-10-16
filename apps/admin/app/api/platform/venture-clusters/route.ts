import { NextResponse } from "next/server";
import { z } from "zod";

import { requireApiSession } from "@/lib/api-auth";
import {
  listVentureClusters,
  refreshVentureClusterFromAtlas,
  registerManualVentureCluster,
  startAtlasVentureCluster,
} from "@/lib/venture-clusters";

export async function GET() {
  const auth = await requireApiSession();
  if (auth.error) return auth.error;
  try {
    const items = await listVentureClusters();
    return NextResponse.json({ items });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load venture clusters.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

const postSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("manual"),
    ventureKey: z.string().min(2).max(64),
    mongoUri: z.string().min(10),
    notes: z.string().max(500).optional(),
  }),
  z.object({
    mode: z.literal("atlas"),
    ventureKey: z.string().min(2).max(64),
    notes: z.string().max(500).optional(),
  }),
  z.object({
    mode: z.literal("refresh"),
    ventureKey: z.string().min(2).max(64),
  }),
]);

export async function POST(req: Request) {
  const auth = await requireApiSession();
  if (auth.error) return auth.error;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const data = parsed.data;
  try {
    if (data.mode === "manual") {
      const result = await registerManualVentureCluster({
        ventureKey: data.ventureKey,
        mongoUri: data.mongoUri,
        notes: data.notes,
        createdByUserId: auth.session!.userId,
      });
      if (result.ok === false) return NextResponse.json({ error: result.error }, { status: 400 });
      return NextResponse.json({ record: result.record });
    }
    if (data.mode === "atlas") {
      const result = await startAtlasVentureCluster({
        ventureKey: data.ventureKey,
        notes: data.notes,
        createdByUserId: auth.session!.userId,
      });
      if (result.ok === false) return NextResponse.json({ error: result.error }, { status: 400 });
      return NextResponse.json({ record: result.record });
    }
    const result = await refreshVentureClusterFromAtlas(data.ventureKey);
    if (result.ok === false) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ record: result.record });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Operation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
