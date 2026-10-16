import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "vensai-venture-admin",
    targetKey: "admin",
    publicHost: process.env.ADMIN_PUBLIC_HOST?.trim() || "admin.vensailabs.in",
    multiTenant: true,
  });
}
