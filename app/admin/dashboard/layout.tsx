import Link from "next/link";
import { logoutAdmin, requireAdminSession } from "@/app/admin/actions";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession();

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-6">
        <div>
          <Link href="/admin/dashboard" className="text-sm font-semibold text-slate-900">
            Rofyt Admin
          </Link>
          <p className="text-xs text-slate-500">
            Platform · org {session.orgCode} · {session.database}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/erp/login" className="text-sm text-emerald-700 hover:underline">
            ERP
          </Link>
          <span className="hidden text-sm text-slate-600 md:inline">{session.email}</span>
          <form action={logoutAdmin}>
            <button type="submit" className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm">
              Log out
            </button>
          </form>
        </div>
      </header>
      <main className="p-4 md:p-6">{children}</main>
    </div>
  );
}
