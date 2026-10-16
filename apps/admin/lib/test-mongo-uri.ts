import { MongoClient } from "mongodb";

/** Verify a venture cluster URI can connect (does not use central env URI). */
export async function testMongoUri(uri: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmed = uri.trim();
  if (!trimmed.startsWith("mongodb://") && !trimmed.startsWith("mongodb+srv://")) {
    return { ok: false, error: "URI must start with mongodb:// or mongodb+srv://" };
  }
  const client = new MongoClient(trimmed, { serverSelectionTimeoutMS: 8_000 });
  try {
    await client.connect();
    await client.db().command({ ping: 1 });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Connection failed." };
  } finally {
    await client.close().catch(() => undefined);
  }
}
