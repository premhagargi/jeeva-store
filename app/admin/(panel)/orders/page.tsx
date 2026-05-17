import Link from "next/link";
import { Search } from "lucide-react";
import { fetchAdminOrders, FILTERS } from "./query";
import OrdersList from "./OrdersList";

export const dynamic = "force-dynamic";

export default async function AdminOrders({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const filter = sp.filter ?? "active";
  const q = (sp.q ?? "").trim();

  const orders = await fetchAdminOrders({ filter, q });

  return (
    <div className="px-4 py-4 flex flex-col gap-4">
      <form action="/admin/orders" method="get" className="flex flex-col gap-2">
        <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-2.5 shadow-sm">
          <Search size={16} className="text-gray-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by phone, name, or order ID..."
            className="flex-1 bg-transparent text-[14px] text-gray-800 outline-none"
          />
          <input type="hidden" name="filter" value={filter} />
        </div>
      </form>

      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 flex-1">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            const params = new URLSearchParams();
            params.set("filter", f.key);
            if (q) params.set("q", q);
            return (
              <Link
                key={f.key}
                href={`/admin/orders?${params.toString()}`}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${
                  active
                    ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200"
                    : "bg-white border border-gray-200 text-gray-600"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>
        <span className="shrink-0 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>

      {q && (
        <p className="text-[12px] text-gray-500">
          {orders.length} match{orders.length === 1 ? "" : "es"} for "{q}"
        </p>
      )}

      <OrdersList initialOrders={orders} filter={filter} q={q} />
    </div>
  );
}
