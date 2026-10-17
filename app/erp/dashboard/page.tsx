import { requireErpSession } from "@/app/erp/actions";
import { tenantDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ErpDashboardPage() {
  const session = await requireErpSession();
  let orgName = "Organization";
  let vehicleCount = 0;
  let locationCount = 0;
  let fleetCount = 0;
  try {
    const db = await tenantDb(session.database);
    const org = await db.collection("organization").findOne({});
    orgName = String(org?.name || orgName);
    vehicleCount = await db.collection("vehicles").countDocuments();
    locationCount = await db.collection("locations").countDocuments();
    fleetCount = await db.collection("fleets").countDocuments().catch(() => 0);
  } catch {
    /* offline */
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{orgName}</h1>
        <p className="text-sm text-slate-500">Car rental ERP · cluster {session.orgCode}</p>
      </div>
      <section className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Fleets", value: fleetCount },
          { label: "Vehicles", value: vehicleCount },
          { label: "Locations", value: locationCount },
          { label: "Org code", value: session.orgCode },
        ].map((card) => (
          <article key={card.label} className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
          </article>
        ))}
      </section>
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900">Roadmap modules</h2>
        <p className="mt-2 text-sm text-slate-600">
          Fleet &amp; location management, vehicle media, incidents, damage and rent calculators, pricing, internal
          bookings, lightweight public booking page, and syndication to the global Rofyt marketplace — see{" "}
          <code className="rounded bg-slate-100 px-1">docs/ROADMAP.md</code>.
        </p>
      </section>
    </div>
  );
}
