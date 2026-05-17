import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";
import { getAdminSession, logoutAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import AdminNav from "./AdminNav";
import Link from "next/link";

async function logout() {
  "use server";
  await logoutAdmin();
  redirect("/admin/login");
}

const getLowStockCount = unstable_cache(
  () => prisma.inventory.count({ where: { stockQty: { lte: 5 } } }),
  ["admin-low-stock-count"],
  { revalidate: 60, tags: ["inventory"] }
);

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const lowStockCount = await getLowStockCount();

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
        <AdminNav />
      </header>
      <main className="pb-12">{children}</main>
    </div>
  );
}
