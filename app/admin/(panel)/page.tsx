import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [productCount, categoryCount, ordersToday, ordersTotal, revenueAgg, lowStock] =
    await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: startOfDay }, status: { not: "CANCELLED" } },
      }),
      prisma.inventory.count({ where: { stockQty: { lt: 10 } } }),
    ]);

  const stats = [
    { label: "Orders today", value: ordersToday, color: "bg-emerald-50 text-emerald-700" },
    { label: "Revenue today", value: `₹${revenueAgg._sum.total ?? 0}`, color: "bg-blue-50 text-blue-700" },
    { label: "Total orders", value: ordersTotal, color: "bg-violet-50 text-violet-700" },
    { label: "Products", value: productCount, color: "bg-amber-50 text-amber-700" },
    { label: "Categories", value: categoryCount, color: "bg-pink-50 text-pink-700" },
    { label: "Low stock", value: lowStock, color: "bg-red-50 text-red-700" },
  ];

  return (
    <div className="px-4 py-4">
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              {s.label}
            </p>
            <p className={`text-[22px] font-bold mt-1 inline-block px-2 py-0.5 rounded-lg ${s.color}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <Link
          href="/admin/orders"
          className="bg-white border border-gray-100 rounded-2xl px-4 py-3.5 text-[14px] font-semibold text-gray-800 active:bg-gray-50"
        >
          → Manage orders
        </Link>
        <Link
          href="/admin/products"
          className="bg-white border border-gray-100 rounded-2xl px-4 py-3.5 text-[14px] font-semibold text-gray-800 active:bg-gray-50"
        >
          → Manage products
        </Link>
      </div>
    </div>
  );
}
