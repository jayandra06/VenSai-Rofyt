/** Cluster 0 = platform DB from .env; customer org codes 1+ use rofyt-{id}. */
export function databaseForOrgCode(orgCode: string) {
  const code = orgCode.trim();
  if (code === "0") return process.env.PLATFORM_DB || "rofyt";
  if (!/^\d+$/.test(code)) return null;
  return `rofyt-${code}`;
}
