import { NextResponse } from "next/server";

import {
  provisioningAdminRequestSchema,
  verifyProvisioningBearer,
} from "@rofyt/provisioning-contract";

export async function POST(req: Request) {
  const secret = process.env.VENTURE_PROVISIONING_SECRET;
  if (!verifyProvisioningBearer(req.headers.get("authorization"), secret)) {
    return NextResponse.json(
      { success: false, status: "failed", message: "Unauthorized provisioning caller." },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, status: "failed", message: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const parsed = provisioningAdminRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, status: "failed", message: "Invalid provisioning payload." },
      { status: 400 }
    );
  }

  if (parsed.data.targetKey !== "erp") {
    return NextResponse.json(
      { success: false, status: "failed", message: "Wrong target for ROFYT ERP." },
      { status: 400 }
    );
  }

  if (!process.env.DATABASE_URL?.trim()) {
    return NextResponse.json(
      {
        success: false,
        status: "failed",
        message: "ROFYT ERP database is not configured yet.",
      },
      { status: 503 }
    );
  }

  // Phase 3+: create admin via Better Auth + Prisma (separate from CRM DB).
  return NextResponse.json(
    {
      success: false,
      status: "failed",
      message: "Administrator persistence not implemented yet — schema/auth wiring in progress.",
    },
    { status: 501 }
  );
}
