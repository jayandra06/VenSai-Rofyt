import { Db, MongoClient } from "mongodb";

const globalForMongo = globalThis as unknown as { mongoClient?: MongoClient };

export function getMongoUri(): string {
  const uri = process.env.MONGODB_URI?.trim() || process.env.DATABASE_URL?.trim();
  if (!uri) {
    throw new Error("MONGODB_URI is not configured.");
  }
  return uri;
}

/** Platform catalog DB (venture registry, future Atlas metadata). */
export function getPlatformDatabaseName(): string {
  return process.env.MONGODB_PLATFORM_DB?.trim() || "vensai_admin_platform";
}

export async function getMongoClient(): Promise<MongoClient> {
  if (globalForMongo.mongoClient) {
    return globalForMongo.mongoClient;
  }
  const client = new MongoClient(getMongoUri());
  await client.connect();
  if (process.env.NODE_ENV !== "production") {
    globalForMongo.mongoClient = client;
  }
  return client;
}

export async function getPlatformDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(getPlatformDatabaseName());
}

/** Per-venture logical database on the cluster (ROFYT, ROFABS, …). */
export function ventureDatabaseName(ventureKey: string): string {
  const key = ventureKey.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const prefix = process.env.MONGODB_VENTURE_DB_PREFIX?.trim() || "vensai_venture_";
  return `${prefix}${key}`;
}

export async function getVentureDb(ventureKey: string): Promise<Db> {
  const client = await getMongoClient();
  return client.db(ventureDatabaseName(ventureKey));
}
