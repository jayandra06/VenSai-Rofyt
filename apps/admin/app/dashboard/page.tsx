import Link from "next/link";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/session";

export default async function AdminDashboardPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const user = await prisma.ventureAdminUser.findUnique({ where: { id: userId } });
  if (!user) redirect("/login");

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-zinc-50">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold">ROFYT Admin</h1>
        <p className="mt-2 text-zinc-400">
          Signed in as <strong className="text-zinc-200">{user.email}</strong> · venture{" "}
          <code className="text-sm">{user.ventureKey}</code>
        </p>
        <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="font-medium">Business control plane</h2>
          <p className="mt-2 text-sm text-zinc-400">
            ERP modules, fleet, bookings, and staff tools will live here in later phases. Your CRM
            seed account is active — use this portal instead of digging through{" "}
            <code className="text-xs">.env</code> files.
          </p>
          <form action="/api/auth/logout" method="post" className="mt-6">
            <button
              type="submit"
              className="text-sm text-zinc-400 underline-offset-4 hover:text-zinc-200 hover:underline"
            >
              Sign out
            </button>
          </form>
          <p className="mt-4 text-xs text-zinc-500">
            Production URL:{" "}
            <Link href="https://admin-rofyt.vensailabs.in" className="underline">
              admin-rofyt.vensailabs.in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
