import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function StockValuePage() {
  const inventory = await prisma.inventory.findMany({
    where: { price: { not: null } },
    include: {
      product: {
        include: { category: true },
      },
    },
    orderBy: [{ product: { category: { name: "asc" } } }, { product: { name: "asc" } }],
  });

  type StockItem = {
    id: string;
    name: string;
    price: number;
    stockQty: number;
    unit: string;
    quantityValue: number | null;
    worth: number;
    isAvailable: boolean;
  };

  const byCategory = new Map<string, { emoji: string | null; items: StockItem[] }>();

  for (const inv of inventory) {
    const cat = inv.product.category;
    if (!byCategory.has(cat.name)) {
      byCategory.set(cat.name, { emoji: cat.emoji, items: [] });
    }
    byCategory.get(cat.name)!.items.push({
      id: inv.product.id,
      name: inv.product.name,
      price: inv.price!,
      stockQty: inv.stockQty,
      unit: inv.unit,
      quantityValue: inv.quantityValue,
      worth: inv.price! * inv.stockQty,
      isAvailable: inv.isAvailable,
    });
  }

  const totalWorth = inventory.reduce((s, inv) => s + inv.price! * inv.stockQty, 0);
  const totalItems = inventory.length;
  const outOfStockCount = inventory.filter((inv) => inv.stockQty === 0).length;

  const fmt = (n: number) =>
    "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <Link
          href="/admin"
          className="w-9 h-9 rounded-xl flex items-center justify-center active:bg-gray-100"
        >
          <ChevronLeft size={20} className="text-gray-700" />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold text-gray-900">Stock Value</p>
          <p className="text-[11px] text-gray-400">
            {totalItems} product{totalItems !== 1 ? "s" : ""} · {outOfStockCount} out of stock
          </p>
        </div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Total worth banner */}
        <div className="bg-teal-600 rounded-2xl p-5 flex flex-col gap-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-200">
            Total stock worth
          </p>
          <p className="text-[32px] font-bold text-white leading-none">{fmt(totalWorth)}</p>
          <p className="text-[12px] text-teal-200 mt-1">
            Based on current price × stock quantity
          </p>
        </div>

        {/* Quick summary row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              Categories
            </p>
            <p className="text-[18px] font-bold text-gray-900 mt-0.5">{byCategory.size}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              Products
            </p>
            <p className="text-[18px] font-bold text-gray-900 mt-0.5">{totalItems}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              Out of stock
            </p>
            <p className={`text-[18px] font-bold mt-0.5 ${outOfStockCount > 0 ? "text-red-600" : "text-gray-900"}`}>
              {outOfStockCount}
            </p>
          </div>
        </div>

        {/* Per-category breakdown */}
        {Array.from(byCategory.entries()).map(([catName, { emoji, items }]) => {
          const catWorth = items.reduce((s, it) => s + it.worth, 0);
          const pct = totalWorth > 0 ? Math.round((catWorth / totalWorth) * 100) : 0;

          return (
            <div key={catName} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Category header */}
              <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {emoji && <span className="text-xl">{emoji}</span>}
                  <p className="text-[14px] font-bold text-gray-900">{catName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-bold text-teal-700">{fmt(catWorth)}</p>
                  <p className="text-[10px] text-gray-400">{pct}% of total</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1 bg-gray-100">
                <div
                  className="h-1 bg-teal-400"
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Product rows */}
              <div className="divide-y divide-gray-50">
                {items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/admin/products/${item.id}/edit`}
                    className="flex items-center px-4 py-3 gap-3 active:bg-gray-50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-gray-800 truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {fmt(item.price)}
                        {item.quantityValue
                          ? ` / ${item.quantityValue}${item.unit}`
                          : ` / ${item.unit}`}
                        {!item.isAvailable && (
                          <span className="ml-1.5 text-gray-300">· hidden</span>
                        )}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[13px] font-bold text-gray-900">{fmt(item.worth)}</p>
                      <p className={`text-[11px] font-semibold ${item.stockQty === 0 ? "text-red-500" : item.stockQty < 10 ? "text-orange-500" : "text-gray-400"}`}>
                        {item.stockQty} in stock
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}

        {inventory.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-[13px]">
            No products with pricing found.
          </div>
        )}
      </div>
    </div>
  );
}
