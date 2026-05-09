import { prisma } from "./prisma";
import { styleFor } from "./category-style";
import type { OrderStatus } from "@/app/components/orders/OrderStatusBadge";

export type OrderItem = {
  id: string;
  productId: string;
  slug: string;
  name: string;
  qty: number;
  unit: string;
  quantityValue: number | null;
  price: number;
  emoji: string;
  bg: string;
  imageUrl: string | null;
};

export type Order = {
  id: string;
  shortId: string;
  date: string;
  time: string;
  status: OrderStatus;
  items: OrderItem[];
  deliveryFee: number;
  discount: number;
  total: number;
  address: string;
  phone: string;
  customer: { name: string | null };
  reorderLines: {
    productId: string;
    slug: string;
    name: string;
    unit: string;
    quantityValue: number | null;
    price: number;
    qty: number;
    emoji: string;
    bg: string;
    imageUrl: string | null;
  }[];
};

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

export async function getOrderById(id: string): Promise<Order> {
  const o = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { include: { product: { include: { category: true } } } },
    },
  });

  if (!o) throw new Error("Order not found");

  const status = STATUS_MAP[o.status] ?? "processing";
  const { date, time } = formatDate(o.createdAt);

  const items: OrderItem[] = o.items.map((it) => {
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
  });

  const reorderLines = o.items.map((it) => {
    const style = styleFor(it.product.category.name);
    return {
      productId: it.productId,
      slug: it.product.slug,
      name: it.productName,
      unit: it.unit,
      quantityValue: it.quantityValue,
      price: it.price,
      qty: it.qty,
      emoji: style.emoji,
      bg: style.bg,
      imageUrl: it.product.imageUrl,
    };
  });

  return {
    id: o.id,
    shortId: o.id.slice(0, 8).toUpperCase(),
    date,
    time,
    status,
    items,
    deliveryFee: o.deliveryFee,
    discount: o.discount,
    total: o.total,
    address: o.address,
    phone: o.phone,
    customer: { name: o.customer.name },
    reorderLines,
  };
}