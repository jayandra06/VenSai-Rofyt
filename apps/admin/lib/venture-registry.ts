import { getPlatformDb, ventureDatabaseName } from "@/lib/mongo";
import { resolveVentureMongoUri } from "@/lib/atlas-provision";

export type VentureRegistryDoc = {
  ventureKey: string;
  databaseName: string;
  /** shared cluster URI today; dedicated URI when Atlas automation assigns a cluster. */
  mongoUriRef: "platform" | "dedicated";
  dedicatedMongoUri?: string;
  atlasClusterName?: string;
  createdAt: Date;
  updatedAt: Date;
};

/** Register venture data plane (DB name on cluster). Called before admin seed. */
export async function ensureVentureRegistered(ventureKey: string): Promise<VentureRegistryDoc> {
  const key = ventureKey.trim().toLowerCase();
  const db = await getPlatformDb();
  const col = db.collection<VentureRegistryDoc>("ventures");
  const now = new Date();
  const databaseName = ventureDatabaseName(key);

  const provision = await resolveVentureMongoUri(key);

  const existing = await col.findOne({ ventureKey: key });
  if (existing) {
    await col.updateOne(
      { ventureKey: key },
      {
        $set: {
          databaseName,
          updatedAt: now,
          ...(provision.mode === "dedicated" && provision.uri
            ? { mongoUriRef: "dedicated", dedicatedMongoUri: provision.uri, atlasClusterName: provision.clusterName }
            : {}),
        },
      },
    );
    return (await col.findOne({ ventureKey: key }))!;
  }

  const doc: VentureRegistryDoc = {
    ventureKey: key,
    databaseName,
    mongoUriRef: provision.mode === "dedicated" ? "dedicated" : "platform",
    ...(provision.mode === "dedicated" && provision.uri
      ? { dedicatedMongoUri: provision.uri, atlasClusterName: provision.clusterName }
      : {}),
    createdAt: now,
    updatedAt: now,
  };
  await col.insertOne(doc);
  return doc;
}
