import { Db, MongoClient } from "mongodb";

const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient;
  indexesEnsured?: boolean;
};

/** Atlas / MongoDB connection string for the admin portal (required). */
export function getMongoUri(): string {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Add your MongoDB cluster URI to the admin portal .env.");
  }
  return uri;
}

/** Single central database for admin.vensailabs.in (ventures + admin users + future modules). */
export function getCentralDatabaseName(): string {
  return process.env.MONGODB_DB_NAME?.trim() || "vensai_admin";
}

export async function getMongoClient(): Promise<MongoClient> {
  if (globalForMongo.mongoClient) {
    return globalForMongo.mongoClient;
  }
  const client = new MongoClient(getMongoUri(), {
    maxPoolSize: 10,
  });
  await client.connect();
  globalForMongo.mongoClient = client;
  return client;
}

/** Central DB handle — all admin portal data lives here until per-venture split is added. */
export async function getCentralDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(getCentralDatabaseName());
}

export async function pingCentralDb(): Promise<{ ok: true; dbName: string } | { ok: false; error: string }> {
  try {
    const db = await getCentralDb();
    await db.command({ ping: 1 });
    return { ok: true, dbName: db.databaseName };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "MongoDB ping failed." };
  }
}

export function isMongoConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI?.trim());
}
