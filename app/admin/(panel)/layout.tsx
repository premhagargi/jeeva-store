import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin, logoutAdmin } from "@/lib/admin-auth";

async function logout() {
  "use server";
  await logoutAdmin();
  redirect("/admin/login");
}

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 print:hidden">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link href="/admin" className="text-[16px] font-bold text-gray-900">
            Jeeva Admin
          </Link>
          <form action={logout}>
            <button className="text-[12px] font-semibold text-gray-400">Logout</button>
          </form>
        </div>
        <nav className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
          <Link
            href="/admin"
            className="shrink-0 px-3 py-1.5 rounded-full text-[13px] font-semibold bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/products"
            className="shrink-0 px-3 py-1.5 rounded-full text-[13px] font-semibold bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
          >
            Products
          </Link>
          <Link
            href="/admin/orders"
            className="shrink-0 px-3 py-1.5 rounded-full text-[13px] font-semibold bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
          >
            Orders
          </Link>
          <Link
            href="/admin/settings"
            className="shrink-0 px-3 py-1.5 rounded-full text-[13px] font-semibold bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
          >
            Settings
          </Link>
        </nav>
      </header>
      <main className="pb-12">{children}</main>
    </div>
  );
}
