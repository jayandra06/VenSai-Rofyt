import { redirect } from "next/navigation";

import { findAdminUserById } from "@/lib/admin-users";
import { ventureDatabaseName } from "@/lib/mongo";
import { getSession } from "@/lib/session";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await findAdminUserById(session.ventureKey, session.userId);
  if (!user) redirect("/login");

  const dbName = ventureDatabaseName(user.ventureKey);

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
            ERP modules, fleet, bookings, and staff tools will live here per venture. MongoDB database
            for this venture: <code className="text-xs text-zinc-300">{dbName}</code>
          </p>
          <p className="mt-3 text-xs text-zinc-500">
            Public URL: admin.vensailabs.in — shared by all VenSai ventures; isolation is by venture
            key and separate MongoDB databases (dedicated clusters later via Atlas automation).
          </p>
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
