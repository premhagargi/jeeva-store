import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(startOfDay);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const [
    productCount,
    categoryCount,
    customerCount,
    ordersToday,
    ordersTotal,
    revenueAgg,
    lowStock,
    weekOrders,
    topItems,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.customer.count(),
    prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: startOfDay }, status: { not: "CANCELLED" } },
    }),
    prisma.inventory.findMany({
      where: { stockQty: { lt: 10 } },
      include: { product: true },
      orderBy: { stockQty: "asc" },
      take: 10,
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: sevenDaysAgo }, status: { not: "CANCELLED" } },
      select: { createdAt: true, total: true },
    }),
    prisma.orderItem.groupBy({
      by: ["productId", "productName"],
      _sum: { qty: true },
      orderBy: { _sum: { qty: "desc" } },
      take: 5,
      where: { order: { createdAt: { gte: sevenDaysAgo } } },
    }),
  ]);

  const stats = [
    { label: "Orders today", value: ordersToday, color: "bg-emerald-50 text-emerald-700" },
    { label: "Revenue today", value: `₹${revenueAgg._sum.total ?? 0}`, color: "bg-blue-50 text-blue-700" },
    { label: "Total orders", value: ordersTotal, color: "bg-violet-50 text-violet-700" },
    { label: "Customers", value: customerCount, color: "bg-cyan-50 text-cyan-700" },
    { label: "Products", value: productCount, color: "bg-amber-50 text-amber-700" },
    { label: "Categories", value: categoryCount, color: "bg-pink-50 text-pink-700" },
  ];

  const buckets: { day: string; total: number; count: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(sevenDaysAgo.getDate() + i);
    buckets.push({
      day: d.toLocaleDateString("en-IN", { weekday: "short" }),
      total: 0,
      count: 0,
    });
  }
  for (const o of weekOrders) {
    const idx = Math.floor(
      (o.createdAt.getTime() - sevenDaysAgo.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (idx >= 0 && idx < 7) {
      buckets[idx].total += o.total;
      buckets[idx].count += 1;
    }
  }
  const maxTotal = Math.max(1, ...buckets.map((b) => b.total));

  return (
    <div className="px-4 py-4 flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              {s.label}
            </p>
            <p className={`text-[20px] font-bold mt-1 inline-block px-2 py-0.5 rounded-lg ${s.color}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-[14px] font-bold text-gray-900">Revenue last 7 days</p>
        <div className="mt-3 flex items-end gap-2 h-32">
          {buckets.map((b, i) => {
            const h = Math.max(4, Math.round((b.total / maxTotal) * 100));
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[10px] font-bold text-gray-600">
                  {b.total > 0 ? `₹${b.total}` : ""}
                </div>
                <div
                  className="w-full bg-emerald-400 rounded-t-md"
                  style={{ height: `${h}%` }}
                  title={`${b.day}: ₹${b.total} (${b.count} orders)`}
                />
                <div className="text-[10px] text-gray-400">{b.day}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-[14px] font-bold text-gray-900">Top sellers (7 days)</p>
        {topItems.length === 0 ? (
          <p className="text-[12px] text-gray-400 mt-2">No sales yet.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {topItems.map((it, i) => (
              <div key={it.productId} className="flex justify-between items-center">
                <span className="text-[13px] text-gray-700">
                  {i + 1}. {it.productName}
                </span>
                <span className="text-[13px] font-bold text-emerald-600">
                  × {it._sum.qty ?? 0}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-bold text-gray-900">Low stock</p>
          <Link href="/admin/products?lowStock=1" className="text-[12px] font-semibold text-emerald-600">
            View all
          </Link>
        </div>
        {lowStock.length === 0 ? (
          <p className="text-[12px] text-gray-400 mt-2">All products well stocked. ✓</p>
        ) : (
          <div className="mt-3 flex flex-col gap-1.5">
            {lowStock.map((inv) => (
              <Link
                key={inv.id}
                href={`/admin/products/${inv.product.id}/edit`}
                className="flex justify-between text-[12px] py-1"
              >
                <span className="text-gray-700 truncate">{inv.product.name}</span>
                <span className="text-red-600 font-bold">{inv.stockQty} left</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
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
