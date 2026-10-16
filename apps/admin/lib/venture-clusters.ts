import { ObjectId } from "mongodb";

import { ensureCentralIndexes } from "@/lib/central-indexes";
import { getCentralDb } from "@/lib/mongo";
import {
  atlasClusterNameForVenture,
  createAtlasCluster,
  fetchAtlasClusterConnectionString,
  getAtlasConfig,
  isAtlasConfigured,
} from "@/lib/atlas-api";
import { testMongoUri } from "@/lib/test-mongo-uri";

export type VentureClusterSource = "manual" | "atlas";
export type VentureClusterStatus = "active" | "provisioning" | "failed";

export type VentureClusterDoc = {
  _id: ObjectId;
  ventureKey: string;
  source: VentureClusterSource;
  status: VentureClusterStatus;
  mongoUri?: string;
  clusterName?: string;
  atlasGroupId?: string;
  lastError?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdByUserId?: string;
};

const COL = "venture_mongo_clusters";

export type VentureClusterPublic = {
  id: string;
  ventureKey: string;
  source: VentureClusterSource;
  status: VentureClusterStatus;
  mongoUri?: string;
  mongoUriMasked?: string;
  clusterName?: string;
  lastError?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

function maskUri(uri: string): string {
  if (uri.length <= 24) return "••••••••";
  return `${uri.slice(0, 18)}…${uri.slice(-8)}`;
}

function toPublic(doc: VentureClusterDoc): VentureClusterPublic {
  return {
    id: doc._id.toString(),
    ventureKey: doc.ventureKey,
    source: doc.source,
    status: doc.status,
    mongoUri: doc.status === "active" ? doc.mongoUri : undefined,
    mongoUriMasked: doc.mongoUri ? maskUri(doc.mongoUri) : undefined,
    clusterName: doc.clusterName,
    lastError: doc.lastError,
    notes: doc.notes,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function listVentureClusters(): Promise<VentureClusterPublic[]> {
  await ensureCentralIndexes();
  const rows = await (await getCentralDb())
    .collection<VentureClusterDoc>(COL)
    .find({})
    .sort({ ventureKey: 1 })
    .toArray();
  return rows.map(toPublic);
}

export async function registerManualVentureCluster(input: {
  ventureKey: string;
  mongoUri: string;
  notes?: string;
  createdByUserId?: string;
}): Promise<{ ok: true; record: VentureClusterPublic } | { ok: false; error: string }> {
  const ventureKey = input.ventureKey.trim().toLowerCase();
  if (ventureKey.length < 2) return { ok: false, error: "Venture key is required." };

  const test = await testMongoUri(input.mongoUri);
  if (test.ok === false) return { ok: false, error: test.error };

  await ensureCentralIndexes();
  const col = (await getCentralDb()).collection<Omit<VentureClusterDoc, "_id">>(COL);
  const now = new Date();
  const mongoUri = input.mongoUri.trim();

  const existing = await col.findOne({ ventureKey });
  if (existing) {
    await col.updateOne(
      { ventureKey },
      {
        $set: {
          source: "manual",
          status: "active",
          mongoUri,
          lastError: undefined,
          notes: input.notes?.trim() || undefined,
          updatedAt: now,
        },
      },
    );
    const updated = await col.findOne({ ventureKey });
    return { ok: true, record: toPublic(updated as VentureClusterDoc) };
  }

  const insert = {
    ventureKey,
    source: "manual" as const,
    status: "active" as const,
    mongoUri,
    notes: input.notes?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
    createdByUserId: input.createdByUserId,
  };
  const result = await col.insertOne(insert);
  return {
    ok: true,
    record: toPublic({ _id: result.insertedId, ...insert } as VentureClusterDoc),
  };
}

export async function startAtlasVentureCluster(input: {
  ventureKey: string;
  notes?: string;
  createdByUserId?: string;
}): Promise<{ ok: true; record: VentureClusterPublic } | { ok: false; error: string }> {
  if (!isAtlasConfigured()) {
    return {
      ok: false,
      error: "Atlas API is not configured. Set ATLAS_PUBLIC_KEY, ATLAS_PRIVATE_KEY, and ATLAS_GROUP_ID in admin .env.",
    };
  }

  const ventureKey = input.ventureKey.trim().toLowerCase();
  const cfg = getAtlasConfig()!;
  const clusterName = atlasClusterNameForVenture(ventureKey);

  await ensureCentralIndexes();
  const col = (await getCentralDb()).collection<Omit<VentureClusterDoc, "_id">>(COL);
  const now = new Date();

  const createResult = await createAtlasCluster(clusterName);
  if (createResult.ok === false) {
    return { ok: false, error: createResult.error };
  }

  const base = {
    ventureKey,
    source: "atlas" as const,
    status: "provisioning" as const,
    clusterName,
    atlasGroupId: cfg.groupId,
    notes: input.notes?.trim() || undefined,
    updatedAt: now,
  };

  const existing = await col.findOne({ ventureKey });
  if (existing) {
    await col.updateOne({ ventureKey }, { $set: { ...base, lastError: undefined } });
  } else {
    await col.insertOne({
      ...base,
      createdAt: now,
      createdByUserId: input.createdByUserId,
    });
  }

  const refreshed = await refreshVentureClusterFromAtlas(ventureKey);
  if (refreshed.ok) return { ok: true, record: refreshed.record };
  const row = await col.findOne({ ventureKey });
  return { ok: true, record: toPublic(row as VentureClusterDoc) };
}

export async function refreshVentureClusterFromAtlas(
  ventureKey: string,
): Promise<{ ok: true; record: VentureClusterPublic } | { ok: false; error: string }> {
  const key = ventureKey.trim().toLowerCase();
  await ensureCentralIndexes();
  const col = (await getCentralDb()).collection<VentureClusterDoc>(COL);
  const row = await col.findOne({ ventureKey: key });
  if (!row) return { ok: false, error: "Venture cluster record not found." };
  if (row.source !== "atlas" || !row.clusterName) {
    return { ok: false, error: "This venture was not created via Atlas." };
  }

  const conn = await fetchAtlasClusterConnectionString(row.clusterName);
  const now = new Date();

  if (conn.ok === false) {
    await col.updateOne(
      { ventureKey: key },
      {
        $set: {
          lastError: conn.error,
          updatedAt: now,
          status: conn.provisioning ? "provisioning" : "failed",
        },
      },
    );
    const updated = await col.findOne({ ventureKey: key });
    return { ok: true, record: toPublic(updated as VentureClusterDoc) };
  }

  await col.updateOne(
    { ventureKey: key },
    {
      $set: {
        mongoUri: conn.uri,
        status: "active",
        lastError: undefined,
        updatedAt: now,
      },
    },
  );
  const updated = await col.findOne({ ventureKey: key });
  return { ok: true, record: toPublic(updated as VentureClusterDoc) };
}
