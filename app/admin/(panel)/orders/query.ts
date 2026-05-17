import "server-only";
import { prisma } from "@/lib/prisma";
import type { OrderStatus, Prisma } from "@prisma/client";
import type { AdminOrder } from "./OrderRow";

export const FILTERS: Array<{ key: string; label: string; status?: OrderStatus }> = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "processing", label: "Processing", status: "PROCESSING" },
  { key: "out", label: "Out for delivery", status: "OUT_FOR_DELIVERY" },
  { key: "delivered", label: "Delivered", status: "DELIVERED" },
  { key: "cancelled", label: "Cancelled", status: "CANCELLED" },
];

export async function fetchAdminOrders({
  filter,
  q,
}: {
  filter: string;
  q: string;
}): Promise<AdminOrder[]> {
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
    include: { customer: true, items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return dbOrders.map((o) => ({
    id: o.id,
    shortId: o.id.slice(0, 8).toUpperCase(),
    status: o.status,
    phone: o.phone,
    customerName: o.customerName ?? o.customer.name,
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
}
