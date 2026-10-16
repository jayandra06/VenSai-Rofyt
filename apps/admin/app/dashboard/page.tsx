import Link from "next/link";
import { redirect } from "next/navigation";

import { findAdminUserById } from "@/lib/admin-users";
import { getCentralDatabaseName, isMongoConfigured } from "@/lib/mongo";
import { getSession } from "@/lib/session";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await findAdminUserById(session.ventureKey, session.userId);
  if (!user) redirect("/login");

  const centralDb = getCentralDatabaseName();

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-zinc-50">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold">VenSai Venture Admin</h1>
        <p className="mt-2 text-zinc-400">
          <strong className="text-zinc-200">{user.ventureKey.toUpperCase()}</strong> ·{" "}
          {user.email}
        </p>
        <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="font-medium">Business workspace</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Central MongoDB database:{" "}
            <code className="text-xs text-zinc-300">{centralDb}</code>
            {isMongoConfigured() ? " · connected via server MONGODB_URI" : " · MONGODB_URI not set on server"}
          </p>
          <Link
            href="/dashboard/clusters"
            className="mt-4 inline-block rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500"
          >
            Manage venture MongoDB clusters
          </Link>
          <form action="/api/auth/logout" method="post" className="mt-6">
            <button
              type="submit"
              className="text-sm text-zinc-400 underline-offset-4 hover:text-zinc-200 hover:underline"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
