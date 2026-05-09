import { prisma } from "@/lib/prisma";
import { styleFor } from "@/lib/category-style";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone") ?? "";

  if (!phone.trim()) {
    return Response.json({ orders: [] });
  }

  const STATUS_MAP: Record<string, string> = {
    PROCESSING: "processing",
    OUT_FOR_DELIVERY: "out_for_delivery",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
  };

  function formatDate(d: Date): { date: string; time: string } {
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();
    const time = d.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    if (sameDay) return { date: "Today", time };
    if (isYesterday) return { date: "Yesterday", time };
    return {
      date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      time,
    };
  }

  const dbOrders = await prisma.order.findMany({
    where: { phone },
    include: {
      items: { include: { product: { include: { category: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const orders = dbOrders.map((o) => {
    const { date, time } = formatDate(o.createdAt);
    return {
      id: o.id,
      shortId: o.id.slice(0, 8).toUpperCase(),
      date,
      time,
      status: STATUS_MAP[o.status] ?? "processing",
      address: o.address,
      deliveryFee: o.deliveryFee,
      discount: o.discount,
      total: o.total,
      items: o.items.map((it) => {
        const style = styleFor(it.product.category.name);
        return {
          id: it.id,
          productId: it.productId,
          slug: it.product.slug,
          name: it.productName,
          qty: it.qty,
          unit:
            it.quantityValue != null
              ? `${it.quantityValue} ${it.unit}`
              : it.unit,
          quantityValue: it.quantityValue,
          price: it.price * it.qty,
          emoji: style.emoji,
          bg: style.bg,
          imageUrl: it.product.imageUrl,
        };
      }),
    };
  });

  return Response.json({ orders });
}