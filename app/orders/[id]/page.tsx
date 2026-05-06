import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, MapPin, Phone, Check, Package, Truck, Home, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { styleFor } from "@/lib/category-style";
import OrderItemRow from "@/app/components/orders/OrderItemRow";
import OrderStatusBadge, { OrderStatus } from "@/app/components/orders/OrderStatusBadge";
import ReorderButton from "./ReorderButton";
import CancelButton from "./CancelButton";

const STATUS_MAP: Record<string, OrderStatus> = {
  PROCESSING: "processing",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

const TIMELINE: Array<{ key: OrderStatus; label: string; icon: any }> = [
  { key: "processing", label: "Order placed", icon: Check },
  { key: "out_for_delivery", label: "Out for delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Home },
];

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const o = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { include: { product: { include: { category: true } } } },
    },
  });

  if (!o) notFound();

  const status = STATUS_MAP[o.status] ?? "processing";
  const isCancelled = status === "cancelled";

  const items = o.items.map((it) => {
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

  const placedAt = o.createdAt.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-2">
        <Link
          href="/orders"
          className="w-9 h-9 rounded-xl flex items-center justify-center active:bg-gray-100"
        >
          <ChevronLeft size={20} className="text-gray-700" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-[15px] font-bold text-gray-900">
            Order #{o.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-[11px] text-gray-400">{placedAt}</p>
        </div>
        <OrderStatusBadge status={status} />
      </div>

      {sp.placed && (
        <div className="mx-4 mt-4 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="text-[14px] font-bold text-emerald-800">Order placed!</p>
            <p className="text-[12px] text-emerald-700 mt-0.5">
              We'll deliver it to you in 8 minutes.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white mt-4 mx-4 rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-3">
          Status
        </p>
        {isCancelled ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
              <X size={16} className="text-red-500" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-gray-900">Cancelled</p>
              <p className="text-[12px] text-gray-400 mt-0.5">This order was cancelled.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-0">
            {TIMELINE.map((step, i) => {
              const currentIndex = TIMELINE.findIndex((s) => s.key === status);
              const done = i <= currentIndex;
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                        done
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    {i < TIMELINE.length - 1 && (
                      <div
                        className={`w-0.5 h-6 ${done && i < currentIndex ? "bg-emerald-500" : "bg-gray-200"}`}
                      />
                    )}
                  </div>
                  <div className={`pt-2 ${i < TIMELINE.length - 1 ? "pb-3" : ""}`}>
                    <p
                      className={`text-[13px] font-semibold ${
                        done ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white mt-3 mx-4 rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-3">
          {items.length} item{items.length > 1 ? "s" : ""}
        </p>
        <div className="flex flex-col gap-3">
          {items.map((it) => (
            <OrderItemRow key={it.id} item={it} />
          ))}
        </div>
      </div>

      <div className="bg-white mt-3 mx-4 rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400 mb-3">
          Bill summary
        </p>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-[13px] text-gray-500">
            <span>Item total</span>
            <span>₹{o.itemTotal}</span>
          </div>
          <div className="flex justify-between text-[13px] text-gray-500">
            <span>Delivery fee</span>
            <span className={o.deliveryFee === 0 ? "text-emerald-600 font-medium" : ""}>
              {o.deliveryFee === 0 ? "FREE" : `₹${o.deliveryFee}`}
            </span>
          </div>
          {o.discount > 0 && (
            <div className="flex justify-between text-[13px] text-emerald-600 font-medium">
              <span>Discount</span>
              <span>− ₹{o.discount}</span>
            </div>
          )}
          <div className="border-t border-dashed border-gray-100 my-1" />
          <div className="flex justify-between text-[15px] font-bold text-gray-900">
            <span>Total paid</span>
            <span>₹{o.total}</span>
          </div>
        </div>
      </div>

      <div className="bg-white mt-3 mx-4 rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <Package size={16} className="text-gray-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400">
              Customer
            </p>
            <p className="text-[14px] font-semibold text-gray-900 mt-0.5">
              {o.customer.name ?? "Customer"}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Phone size={16} className="text-gray-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400">
              Phone
            </p>
            <p className="text-[14px] font-semibold text-gray-900 mt-0.5">{o.phone}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400">
              Delivery address
            </p>
            <p className="text-[13px] text-gray-700 mt-0.5 leading-snug">{o.address}</p>
          </div>
        </div>
      </div>

      {status === "processing" && (
        <div className="mt-4 flex justify-center">
          <CancelButton orderId={o.id} orderPhone={o.phone} />
        </div>
      )}

      <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto px-4 z-40">
        <ReorderButton lines={reorderLines} />
      </div>
    </div>
  );
}
