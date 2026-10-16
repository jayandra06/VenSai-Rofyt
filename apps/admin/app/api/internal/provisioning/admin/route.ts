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

  const body = await req.json().catch(() => null);
  const parsed = provisioningAdminRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, status: "failed", message: "Invalid provisioning payload." },
      { status: 400 }
    );
  }

  if (parsed.data.targetKey !== "admin") {
    return NextResponse.json(
      { success: false, status: "failed", message: "Wrong target for ROFYT Admin Portal." },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      status: "failed",
      message: "Administrator persistence not implemented yet — separate admin identity DB pending.",
    },
    { status: 501 }
  );
}
