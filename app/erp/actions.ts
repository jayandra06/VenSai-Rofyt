"use server";

import { redirect } from "next/navigation";
import { clearSession, getSession, setSession } from "@/lib/auth";
import { tenantDb } from "@/lib/db";
import { authenticate } from "@/lib/login";
import { hashPassword } from "@/lib/password";

export async function loginErp(formData: FormData) {
  const orgCode = String(formData.get("orgCode") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  if (!orgCode || !email || !password) redirect("/erp/login?error=1");

  try {
    const session = await authenticate("erp", orgCode, email, password);
    if (!session) redirect("/erp/login?error=1");
    await setSession(session);
  } catch {
    redirect("/erp/login?error=2");
  }

  const current = await getSession("erp");
  if (current?.mustChangePassword) redirect("/erp/change-password");
  redirect("/erp/dashboard");
}

export async function changePassword(formData: FormData) {
  const session = await getSession("erp");
  if (!session) redirect("/erp/login");
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");
  if (password.length < 8 || password !== confirm) redirect("/erp/change-password?error=1");

  const hashed = hashPassword(password);
  const db = await tenantDb(session.database);
  await db.collection("admins").updateOne(
    { email: session.email },
    {
      $set: {
        ...hashed,
        mustChangePassword: false,
        updatedAt: new Date(),
      },
    },
  );
  await setSession({ ...session, mustChangePassword: false });
  redirect("/erp/dashboard");
}

export async function logoutErp() {
  await clearSession("erp");
  redirect("/erp/login");
}

export async function requireErpSession() {
  const session = await getSession("erp");
  if (!session) redirect("/erp/login");
  if (session.mustChangePassword) redirect("/erp/change-password");
  return session;
}
