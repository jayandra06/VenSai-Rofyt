import { tenantDb } from "@/lib/db";
import { requireAdminSession } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await requireAdminSession();
  let orgCount = 0;
  let vehicleCount = 0;
  try {
    const db = await tenantDb(session.database);
    vehicleCount = await db.collection("vehicles").countDocuments();
    orgCount = await db.collection("platform_orgs").countDocuments().catch(() => 0);
  } catch {
    /* offline */
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Platform overview</h1>
        <p className="text-sm text-slate-500">Signed in as {session.email}</p>
      </div>
      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Platform DB</p>
          <p className="mt-2 font-mono text-lg font-semibold">{session.database}</p>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Platform vehicles (staging)</p>
          <p className="mt-2 text-2xl font-semibold">{vehicleCount}</p>
        </article>
        <article className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Indexed orgs (future)</p>
          <p className="mt-2 text-2xl font-semibold">{orgCount}</p>
        </article>
      </section>
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900">What lives here</h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-600">
          <li>Marketplace feed from all tenant fleets (rofyt.vensailabs.in public catalog)</li>
          <li>Licensing, cluster health, and VenSai operator tools</li>
          <li>Customer companies use <strong>/erp</strong> with org codes 1, 2, 3…</li>
        </ul>
      </section>
    </div>
  );
}
