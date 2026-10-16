import DigestClient from "digest-fetch";

const ATLAS_BASE = "https://cloud.mongodb.com/api/atlas/v2";

export function isAtlasConfigured(): boolean {
  return Boolean(
    process.env.ATLAS_PUBLIC_KEY?.trim() &&
      process.env.ATLAS_PRIVATE_KEY?.trim() &&
      process.env.ATLAS_GROUP_ID?.trim(),
  );
}

export function getAtlasConfig() {
  if (!isAtlasConfigured()) return null;
  return {
    publicKey: process.env.ATLAS_PUBLIC_KEY!.trim(),
    privateKey: process.env.ATLAS_PRIVATE_KEY!.trim(),
    groupId: process.env.ATLAS_GROUP_ID!.trim(),
    region: process.env.ATLAS_REGION?.trim() || "AP_SOUTH_1",
  };
}

function atlasClient() {
  const cfg = getAtlasConfig();
  if (!cfg) throw new Error("Atlas is not configured.");
  return {
    cfg,
    client: new DigestClient(cfg.publicKey, cfg.privateKey),
  };
}

/** Atlas cluster names: lowercase alphanumeric, max 23 chars for M0. */
export function atlasClusterNameForVenture(ventureKey: string): string {
  const slug = ventureKey.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `v${slug}`.slice(0, 23);
}

export async function createAtlasCluster(
  clusterName: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { cfg, client } = atlasClient();
    const res = await client.fetch(`${ATLAS_BASE}/groups/${cfg.groupId}/clusters`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/vnd.atlas.2023-01-01+json" },
      body: JSON.stringify({
        name: clusterName,
        clusterType: "REPLICASET",
        providerSettings: {
          providerName: "TENANT",
          backingProviderName: "AWS",
          regionName: cfg.region,
        },
      }),
    });
    if (res.status === 409) {
      return { ok: true };
    }
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: text || `Atlas returned ${res.status}.` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Atlas request failed." };
  }
}

export async function fetchAtlasClusterConnectionString(
  clusterName: string,
): Promise<
  { ok: true; uri: string } | { ok: false; error: string; provisioning?: boolean }
> {
  try {
    const { cfg, client } = atlasClient();
    const res = await client.fetch(
      `${ATLAS_BASE}/groups/${cfg.groupId}/clusters/${encodeURIComponent(clusterName)}`,
      {
        headers: { Accept: "application/vnd.atlas.2023-01-01+json" },
      },
    );
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: text || `Atlas returned ${res.status}.` };
    }
    const data = (await res.json()) as {
      stateName?: string;
      connectionStrings?: { standardSrv?: string; standard?: string };
    };
    if (data.stateName && data.stateName !== "IDLE") {
      return {
        ok: false,
        error: `Cluster is ${data.stateName}. Try refresh in a few minutes.`,
        provisioning: true,
      };
    }
    const uri =
      data.connectionStrings?.standardSrv ||
      data.connectionStrings?.standard ||
      "";
    if (!uri) {
      return {
        ok: false,
        error: "Cluster is up but no connection string yet. Create a database user in Atlas, then refresh.",
        provisioning: true,
      };
    }
    return { ok: true, uri };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Atlas request failed." };
  }
}
