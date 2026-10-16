import { NextResponse } from "next/server";

import { getCentralDatabaseName, isMongoConfigured, pingCentralDb } from "@/lib/mongo";

export async function GET() {
  const mongoConfigured = isMongoConfigured();
  const mongo = mongoConfigured ? await pingCentralDb() : { ok: false as const, error: "MONGODB_URI not set" };
  let mongoError: string | undefined;
  if (mongo.ok === false) mongoError = mongo.error;

  return NextResponse.json({
    ok: mongo.ok,
    service: "vensai-venture-admin",
    targetKey: "admin",
    publicHost: process.env.ADMIN_PUBLIC_HOST?.trim() || "admin.vensailabs.in",
    multiTenant: true,
    mongo: {
      configured: mongoConfigured,
      connected: mongo.ok,
      centralDatabase: getCentralDatabaseName(),
      ...(mongoError ? { error: mongoError } : {}),
    },
  });
}
