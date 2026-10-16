/**
 * Venture data-plane provisioning.
 *
 * Today: one MongoDB cluster (MONGODB_URI); each venture gets its own database name.
 * Later: set ATLAS_* env vars and implement Atlas Admin API to create a cluster per venture.
 */

export type VentureMongoResolution =
  | { mode: "platform"; uri: string }
  | { mode: "dedicated"; uri: string; clusterName: string };

export async function resolveVentureMongoUri(ventureKey: string): Promise<VentureMongoResolution> {
  const platformUri = process.env.MONGODB_URI?.trim() || process.env.DATABASE_URL?.trim();
  if (!platformUri) {
    throw new Error("MONGODB_URI is required.");
  }

  const atlasEnabled =
    process.env.ATLAS_AUTO_CLUSTER?.trim() === "1" &&
    process.env.ATLAS_PUBLIC_KEY?.trim() &&
    process.env.ATLAS_PRIVATE_KEY?.trim() &&
    process.env.ATLAS_GROUP_ID?.trim();

  if (atlasEnabled) {
    // Phase 2: POST /api/atlas/v2/groups/{groupId}/clusters — store returned SRV in venture registry.
    // Intentionally not implemented yet; fall back to shared cluster so CRM seed keeps working.
    void ventureKey;
  }

  return { mode: "platform", uri: platformUri };
}
