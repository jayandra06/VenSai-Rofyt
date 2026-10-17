import { requireErpSession } from "@/app/erp/actions";

export default async function FleetsPage() {
  await requireErpSession();
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">Fleets</h1>
      <p className="mt-2 text-sm text-slate-600">
        Companies can operate one or many fleets; each fleet links to locations and vehicles. CRUD UI coming in the
        next sprint.
      </p>
    </div>
  );
}
