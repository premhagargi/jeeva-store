"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, RotateCcw, ChevronRight } from "lucide-react";
import OrderStatusBadge, { OrderStatus } from "./OrderStatusBadge";
import OrderItemRow, { OrderItem } from "./OrderItemRow";
import { addLines } from "@/lib/cart";

export interface Order {
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
  deliveryTime?: string;
}

export default function OrderCard({ order }: { order: Order }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const previewItems = order.items.slice(0, 2);
  const hiddenCount = order.items.length - previewItems.length;

  function handleReorder() {
    addLines(
      order.items.map((it) => ({
        productId: it.productId,
        slug: it.slug,
        name: it.name,
        unit: it.unit.replace(/^[\d.]+\s*/, ""),
        quantityValue: it.quantityValue,
        price: Math.round(it.price / it.qty),
        qty: it.qty,
        emoji: it.emoji,
        bg: it.bg,
        imageUrl: it.imageUrl,
      })),
    );
    router.push("/cart");
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] text-gray-400 font-medium">
            {order.date} · {order.time}
          </p>
          <p className="text-[12px] font-semibold text-gray-500 mt-0.5">
            Order #{order.shortId}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {order.deliveryTime && order.status === "delivered" && (
        <div className="mx-4 mb-3 bg-emerald-50 rounded-xl px-3 py-2 flex items-center gap-2">
          <span className="text-base">⚡</span>
          <span className="text-[12px] font-semibold text-emerald-700">
            {order.deliveryTime}
          </span>
        </div>
      )}

      <div className="mx-4 border-t border-dashed border-gray-100 mb-3" />

      <div className="px-4 flex flex-col gap-3">
        {(expanded ? order.items : previewItems).map((item) => (
          <OrderItemRow key={item.id} item={item} />
        ))}
      </div>

      {order.items.length > 2 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mx-4 mt-3 flex items-center gap-1 text-[12px] font-semibold text-emerald-600"
        >
          {expanded ? (
            <>
              <ChevronUp size={14} /> Show less
            </>
          ) : (
            <>
              <ChevronDown size={14} /> +{hiddenCount} more item{hiddenCount > 1 ? "s" : ""}
            </>
          )}
        </button>
      )}

      <div className="mx-4 mt-4 border-t border-gray-100" />

      <div className="px-4 py-3 flex flex-col gap-1.5">
        <div className="flex justify-between text-[12px] text-gray-500">
          <span>Item total</span>
          <span>₹{order.total + order.discount - order.deliveryFee}</span>
        </div>
        {order.deliveryFee > 0 && (
          <div className="flex justify-between text-[12px] text-gray-500">
            <span>Delivery fee</span>
            <span>₹{order.deliveryFee}</span>
          </div>
        )}
        {order.discount > 0 && (
          <div className="flex justify-between text-[12px] text-emerald-600 font-medium">
            <span>Discount</span>
            <span>− ₹{order.discount}</span>
          </div>
        )}
        <div className="flex justify-between text-[13px] font-bold text-gray-900 mt-1">
          <span>Total paid</span>
          <span>₹{order.total}</span>
        </div>
      </div>

      <div className="mx-4 mb-3 bg-gray-50 rounded-xl px-3 py-2.5 flex items-start gap-2">
        <span className="text-sm mt-0.5">📍</span>
        <p className="text-[11.5px] text-gray-500 leading-snug">{order.address}</p>
      </div>

      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={handleReorder}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-emerald-500 text-emerald-600 text-[13px] font-semibold active:scale-95 transition-transform"
        >
          <RotateCcw size={14} />
          Reorder
        </button>
        <Link
          href={`/orders/${order.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-[13px] font-semibold active:scale-95 transition-transform"
        >
          Details
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}
