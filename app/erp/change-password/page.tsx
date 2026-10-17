import { redirect } from "next/navigation";
import { changePassword } from "@/app/erp/actions";
import { getSession } from "@/lib/auth";

export default async function ChangePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession("erp");
  if (!session) redirect("/erp/login");
  if (!session.mustChangePassword) redirect("/erp/dashboard");
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <form action={changePassword} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Set a new password</h1>
        <p className="mt-1 text-sm text-slate-500">Required on first login for org {session.orgCode}.</p>
        {error === "1" ? (
          <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            Passwords must match and be at least 8 characters.
          </p>
        ) : null}
        <label className="mt-6 block text-sm font-medium text-slate-700">
          New password
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-600"
          />
        </label>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Confirm password
          <input
            name="confirm"
            type="password"
            required
            minLength={8}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-600"
          />
        </label>
        <button className="mt-6 w-full rounded-lg bg-emerald-600 py-2.5 font-medium text-white">Save password</button>
      </form>
    </main>
  );
}
