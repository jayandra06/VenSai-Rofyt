import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-white">
      <p className="text-sm font-semibold tracking-wide text-emerald-400">Rofyt</p>
      <h1 className="mt-3 max-w-xl text-center text-4xl font-semibold">Car rental platform</h1>
      <p className="mt-4 max-w-lg text-center text-slate-400">
        One Next.js deployment: platform operations for VenSai Labs, and the ERP for each licensed rental company
        (org code from your invitation).
      </p>
      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Link
          href="/admin/login"
          className="rounded-xl bg-white px-8 py-3 text-center font-medium text-slate-900 hover:bg-slate-100"
        >
          Rofyt Admin
        </Link>
        <Link
          href="/erp/login"
          className="rounded-xl border border-slate-600 px-8 py-3 text-center font-medium text-white hover:border-emerald-500"
        >
          Car rental ERP
        </Link>
      </div>
      <p className="mt-12 max-w-md text-center text-xs text-slate-500">
        Global marketplace and mobile apps are planned on the same platform — see docs/ROADMAP.md in the repo.
      </p>
    </main>
  );
}