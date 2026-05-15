import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession, logoutAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

async function logout() {
  "use server";
  await logoutAdmin();
  redirect("/admin/login");
}

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/admins", label: "Admins" },
  { href: "/admin/audit", label: "Audit" },
];

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const lowStockCount = await prisma.inventory.count({
    where: { stockQty: { lte: 5 } },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 print:hidden">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link href="/admin" className="text-[16px] font-bold text-gray-900">
            Jeeva Admin
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold text-gray-500">
              {session.displayName ?? session.username}
            </span>
            <form action={logout}>
              <button className="text-[12px] font-semibold text-gray-400">Logout</button>
            </form>
          </div>
        </div>
        {lowStockCount > 0 && (
          <Link
            href="/admin/products?lowStock=1"
            className="block bg-red-50 border-t border-red-100 px-4 py-1.5 text-[11px] font-bold text-red-600"
          >
            ⚠️ {lowStockCount} product{lowStockCount === 1 ? "" : "s"} low on stock — tap to review
          </Link>
        )}
        <nav className="px-4 pb-2 pt-1 flex gap-2 overflow-x-auto no-scrollbar">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="shrink-0 px-3 py-1.5 rounded-full text-[13px] font-semibold bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="pb-12">{children}</main>
    </div>
  );
}
