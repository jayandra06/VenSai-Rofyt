import { requireErpSession } from "@/app/erp/actions";

export default async function LocationsPage() {
  await requireErpSession();
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">Locations</h1>
      <p className="mt-2 text-sm text-slate-600">
        Branches and pickup points per fleet — multi-location operators supported. Module in development.
      </p>
    </div>
  );
}
