"use server";

import { redirect } from "next/navigation";
import { clearSession, getSession, setSession } from "@/lib/auth";
import { authenticate } from "@/lib/login";

export async function loginAdmin(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  if (!email || !password) redirect("/admin/login?error=1");

  try {
    const session = await authenticate("admin", "0", email, password);
    if (!session) redirect("/admin/login?error=1");
    await setSession(session);
  } catch {
    redirect("/admin/login?error=2");
  }
  redirect("/admin/dashboard");
}

export async function logoutAdmin() {
  await clearSession("admin");
  redirect("/admin/login");
}

export async function requireAdminSession() {
  const session = await getSession("admin");
  if (!session) redirect("/admin/login");
  return session;
}
