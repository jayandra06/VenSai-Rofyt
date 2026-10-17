import Link from "next/link";
import { logoutErp, requireErpSession } from "@/app/erp/actions";

const nav = [
  { href: "/erp/dashboard", label: "Overview" },
  { href: "/erp/dashboard/fleets", label: "Fleets" },
  { href: "/erp/dashboard/locations", label: "Locations" },
];

export default async function ErpDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireErpSession();

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 md:px-6">
        <div>
          <p className="text-sm font-semibold text-emerald-700">Rofyt ERP</p>
          <p className="text-xs text-slate-500">
            Org {session.orgCode} · {session.database}
          </p>
        </div>
        <nav className="flex flex-wrap gap-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-600 md:inline">{session.email}</span>
          <form action={logoutErp}>
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
