import { getCentralDb } from "@/lib/mongo";

const globalForMongo = globalThis as unknown as { indexesEnsured?: boolean };

/** Idempotent indexes for the central admin database. */
export async function ensureCentralIndexes() {
  if (globalForMongo.indexesEnsured) return;
  const db = await getCentralDb();
  await db.collection("ventures").createIndex({ ventureKey: 1 }, { unique: true });
  await db.collection("admin_users").createIndex({ ventureKey: 1, email: 1 }, { unique: true });
  await db.collection("admin_users").createIndex({ email: 1 });
  await db.collection("venture_mongo_clusters").createIndex({ ventureKey: 1 }, { unique: true });
  globalForMongo.indexesEnsured = true;
}
