import { redirect } from "next/navigation";
import { loginErp } from "@/app/erp/actions";
import { getSession } from "@/lib/auth";

export default async function ErpLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession("erp");
  if (session) {
    if (session.mustChangePassword) redirect("/erp/change-password");
    redirect("/erp/dashboard");
  }
  const { error } = await searchParams;

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden bg-[#0F172A] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-400">Rofyt ERP</p>
          <h1 className="mt-4 max-w-md text-4xl font-semibold leading-tight">Car rental operations</h1>
          <p className="mt-4 max-w-sm text-slate-300">Fleet, locations, pricing, and bookings for your company.</p>
        </div>
        <p className="text-sm text-slate-500">Use the org code from your VenSai invitation email.</p>
      </section>
      <section className="flex items-center justify-center bg-slate-50 px-6">
        <form action={loginErp} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Company sign in</h2>
          <p className="mt-1 text-sm text-slate-500">Organization code, email, and password.</p>
          {error === "1" ? (
            <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">Invalid credentials or org code.</p>
          ) : null}
          {error === "2" ? (
            <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">Could not reach MongoDB.</p>
          ) : null}
          <label className="mt-6 block text-sm font-medium text-slate-700">
            Organization code
            <input
              name="orgCode"
              required
              inputMode="numeric"
              placeholder="1"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-mono outline-none focus:border-emerald-600"
            />
          </label>
          <label className="mt-4 block text-sm font-medium text-slate-700">
            Email
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-600"
            />
          </label>
          <label className="mt-4 block text-sm font-medium text-slate-700">
            Password
            <input
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-600"
            />
          </label>
          <button className="mt-6 w-full rounded-lg bg-emerald-600 py-2.5 font-medium text-white hover:bg-emerald-700">
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
}
