import { redirect } from "next/navigation";

import { getSessionUserId } from "@/lib/session";

export default async function AdminHomePage() {
  const userId = await getSessionUserId();
  redirect(userId ? "/dashboard" : "/login");
}
