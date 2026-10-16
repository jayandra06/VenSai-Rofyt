import { getCentralDb } from "@/lib/mongo";
import { ensureCentralIndexes } from "@/lib/central-indexes";

export type VentureRegistryDoc = {
  ventureKey: string;
  displayName?: string;
  /** Reserved: dedicated cluster URI when Atlas automation is enabled. */
  dedicatedMongoUri?: string;
  atlasClusterName?: string;
  createdAt: Date;
  updatedAt: Date;
};

/** Register a venture in the central admin DB (called before admin seed). */
export async function ensureVentureRegistered(ventureKey: string): Promise<VentureRegistryDoc> {
  await ensureCentralIndexes();
  const key = ventureKey.trim().toLowerCase();
  const db = await getCentralDb();
  const col = db.collection<VentureRegistryDoc>("ventures");
  const now = new Date();

  const existing = await col.findOne({ ventureKey: key });
  if (existing) {
    await col.updateOne({ ventureKey: key }, { $set: { updatedAt: now } });
    return (await col.findOne({ ventureKey: key }))!;
  }

  const doc: VentureRegistryDoc = {
    ventureKey: key,
    createdAt: now,
    updatedAt: now,
  };
  await col.insertOne(doc);
  return doc;
}
