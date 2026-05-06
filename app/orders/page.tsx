import { prisma } from "@/lib/prisma";
import { styleFor } from "@/lib/category-style";
import OrderCard, { Order } from "../components/orders/OrderCard";
import EmptyOrders from "../components/orders/EmptyOrders";
import PhonePrompt from "./PhonePrompt";
import PhoneSync from "./PhoneSync";
import type { OrderStatus } from "../components/orders/OrderStatusBadge";

const STATUS_MAP: Record<string, OrderStatus> = {
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

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string; placed?: string }>;
}) {
  const sp = await searchParams;
  const phone = sp.phone?.trim() ?? "";

  if (!phone) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-4">
          <h1 className="text-[20px] font-bold text-gray-900">My Orders</h1>
        </div>
        <PhonePrompt />
      </div>
    );
  }

  const dbOrders = await prisma.order.findMany({
    where: { phone },
    include: {
      items: { include: { product: { include: { category: true } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const orders: Order[] = dbOrders.map((o) => {
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
            it.quantityValue != null ? `${it.quantityValue} ${it.unit}` : it.unit,
          quantityValue: it.quantityValue,
          price: it.price * it.qty,
          emoji: style.emoji,
          bg: style.bg,
          imageUrl: it.product.imageUrl,
        };
      }),
    };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900">My Orders</h1>
          <p className="text-[11px] text-gray-400 mt-0.5">{phone}</p>
        </div>
        <PhoneSync currentPhone={phone} />
      </div>

      {sp.placed && (
        <div className="mx-4 mt-4 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-emerald-700">
          ✅ Order placed! We'll deliver in 8 minutes.
        </div>
      )}

      <div className="px-4 py-4 flex flex-col gap-4">
        {orders.length === 0 ? (
          <EmptyOrders />
        ) : (
          orders.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </div>
    </div>
  );
}
