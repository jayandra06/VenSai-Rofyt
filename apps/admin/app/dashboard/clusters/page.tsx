import Link from "next/link";
import { redirect } from "next/navigation";

import { VentureClusterRegistry } from "@/components/VentureClusterRegistry";
import { findAdminUserById } from "@/lib/admin-users";
import { getSession } from "@/lib/session";

export default async function VentureClustersPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await findAdminUserById(session.ventureKey, session.userId);
  if (!user) redirect("/login");

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-zinc-50">
      <div className="mx-auto max-w-3xl">
        <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-300">
          ← Dashboard
        </Link>
        <h1 className="mt-4 text-2xl font-semibold">MongoDB for ventures</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Signed in as {user.email}. Register cluster URIs per venture for CRM and downstream apps.
        </p>
        <VentureClusterRegistry />
      </div>
    </main>
  );
}
