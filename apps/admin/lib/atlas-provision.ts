/**
 * Reserved for Atlas Admin API — dedicated cluster per venture.
 * Central DB uses MONGODB_URI today; venture rows live in `ventures` collection.
 */

export async function resolveVentureMongoUri(_ventureKey: string): Promise<{ uri: string }> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) throw new Error("MONGODB_URI is not set.");
  return { uri };
}
