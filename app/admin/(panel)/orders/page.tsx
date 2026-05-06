import Link from "next/link";
import { Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import OrderRow, { AdminOrder } from "./OrderRow";
import type { OrderStatus, Prisma } from "@prisma/client";

const FILTERS: Array<{ key: string; label: string; status?: OrderStatus }> = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "processing", label: "Processing", status: "PROCESSING" },
  { key: "out", label: "Out for delivery", status: "OUT_FOR_DELIVERY" },
  { key: "delivered", label: "Delivered", status: "DELIVERED" },
  { key: "cancelled", label: "Cancelled", status: "CANCELLED" },
];

export default async function AdminOrders({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const filter = sp.filter ?? "active";
  const q = (sp.q ?? "").trim();

  const where: Prisma.OrderWhereInput = {};
  if (filter === "active") {
    where.status = { in: ["PROCESSING", "OUT_FOR_DELIVERY"] };
  } else {
    const f = FILTERS.find((x) => x.key === filter);
    if (f?.status) where.status = f.status;
  }

  if (q) {
    const digits = q.replace(/\D/g, "");
    const idLower = q.toLowerCase();
    where.OR = [
      { phone: { contains: digits || q } },
      { customer: { name: { contains: q, mode: "insensitive" } } },
      { id: { startsWith: idLower } },
    ];
  }

  const dbOrders = await prisma.order.findMany({
    where,
    include: {
      customer: true,
      items: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const orders: AdminOrder[] = dbOrders.map((o) => ({
    id: o.id,
    shortId: o.id.slice(0, 8).toUpperCase(),
    status: o.status,
    phone: o.phone,
    customerName: o.customer.name,
    address: o.address,
    total: o.total,
    createdAt: o.createdAt.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
    itemCount: o.items.length,
    items: o.items.map((it) => ({
      name: it.productName,
      qty: it.qty,
      unit:
        it.quantityValue != null ? `${it.quantityValue} ${it.unit}` : it.unit,
      price: it.price,
    })),
  }));

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

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
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

      {q && (
        <p className="text-[12px] text-gray-500">
          {orders.length} match{orders.length === 1 ? "" : "es"} for "{q}"
        </p>
      )}

      {orders.length === 0 ? (
        <p className="text-center text-[13px] text-gray-400 py-12">No orders.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((o) => (
            <OrderRow key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}
