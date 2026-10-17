import type { RofytApp, RofytSession } from "@/lib/auth";
import { tenantDb } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { databaseForOrgCode } from "@/lib/tenant";
import type { Document } from "mongodb";

type AdminDoc = Document & {
  email?: string;
  role?: string;
  orgCode?: string;
  passwordAlgo?: string;
  passwordSalt?: string;
  passwordHash?: string;
  mustChangePassword?: boolean;
};

function passwordOk(admin: AdminDoc, password: string) {
  return (
    admin.passwordAlgo === "scrypt" &&
    typeof admin.passwordSalt === "string" &&
    typeof admin.passwordHash === "string" &&
    verifyPassword(password, admin.passwordSalt, admin.passwordHash)
  );
}

export async function authenticate(
  app: RofytApp,
  orgCode: string,
  email: string,
  password: string,
): Promise<RofytSession | null> {
  const database = databaseForOrgCode(orgCode);
  if (!database) return null;

  if (app === "admin" && orgCode !== "0") return null;
  if (app === "erp" && orgCode === "0") return null;

  const db = await tenantDb(database);
  const admin = (await db.collection("admins").findOne({ email })) as AdminDoc | null;
  if (!admin || !passwordOk(admin, password)) return null;

  if (app === "admin") {
    const role = admin.role === "platform_admin" || admin.role === "admin" ? "platform_admin" : null;
    if (!role) return null;
    return {
      app: "admin",
      email,
      orgCode: "0",
      database,
      role: "platform_admin",
      mustChangePassword: admin.mustChangePassword === true,
    };
  }

  if (admin.role !== "org_admin") return null;
  const docOrg = String(admin.orgCode ?? "").trim();
  if (docOrg && docOrg !== orgCode) return null;

  return {
    app: "erp",
    email,
    orgCode,
    database,
    role: "org_admin",
    mustChangePassword: admin.mustChangePassword === true,
  };
}
