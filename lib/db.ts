import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const globalForMongo = globalThis as unknown as { rofytMongo?: Promise<MongoClient> };

function clientPromise() {
  if (!uri) throw new Error("MONGODB_URI is missing");
  if (!globalForMongo.rofytMongo) {
    globalForMongo.rofytMongo = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 }).connect();
  }
  return globalForMongo.rofytMongo;
}

export async function tenantDb(database: string) {
  const client = await clientPromise();
  return client.db(database);
}
