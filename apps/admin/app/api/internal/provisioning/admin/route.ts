import { NextResponse } from "next/server";

import {
  provisioningAdminRequestSchema,
  verifyProvisioningBearer,
} from "@rofyt/provisioning-contract";

import { seedAdminUser } from "@/lib/admin-users";

export async function POST(req: Request) {
  const secret = process.env.VENTURE_PROVISIONING_SECRET;
  if (!verifyProvisioningBearer(req.headers.get("authorization"), secret)) {
    return NextResponse.json(
      { success: false, status: "failed", message: "Unauthorized provisioning caller." },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, status: "failed", message: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const parsed = provisioningAdminRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, status: "failed", message: "Invalid provisioning payload." },
      { status: 400 },
    );
  }

  if (parsed.data.targetKey !== "admin") {
    return NextResponse.json(
      { success: false, status: "failed", message: "Wrong target for ROFYT Admin Portal." },
      { status: 400 },
    );
  }

  if (!process.env.DATABASE_URL?.trim()) {
    return NextResponse.json(
      {
        success: false,
        status: "failed",
        message: "Admin portal database is not configured (DATABASE_URL).",
      },
      { status: 503 },
    );
  }

  try {
    const status = await seedAdminUser({
      ventureKey: parsed.data.ventureKey,
      email: parsed.data.adminEmail,
      password: parsed.data.adminPassword,
    });

    return NextResponse.json({
      success: true,
      status,
      venture: parsed.data.ventureKey,
      target: "admin",
      adminEmail: parsed.data.adminEmail,
      message:
        status === "seeded"
          ? "Administrator account created. You can sign in at /login."
          : "Administrator account updated. Sign in at /login with the new password.",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to persist administrator.";
    return NextResponse.json(
      { success: false, status: "failed", message },
      { status: 500 },
    );
  }
}
