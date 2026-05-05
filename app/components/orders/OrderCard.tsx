"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, RotateCcw, HelpCircle } from "lucide-react";
import OrderStatusBadge, { OrderStatus } from "./OrderStatusBadge";
import OrderItemRow, { OrderItem } from "./OrderItemRow";

export interface Order {
  id: string;
  date: string;
  time: string;
  status: OrderStatus;
  items: OrderItem[];
  deliveryFee: number;
  discount: number;
  total: number;
  address: string;
  deliveryTime?: string; // e.g. "Delivered in 8 mins"
}

export default function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);

  const previewItems = order.items.slice(0, 2);
  const hiddenCount = order.items.length - previewItems.length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] text-gray-400 font-medium">
            {order.date} · {order.time}
          </p>
          <p className="text-[12px] font-semibold text-gray-500 mt-0.5">
            Order #{order.id}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* ── Delivery ribbon (only for delivered) ── */}
      {order.deliveryTime && order.status === "delivered" && (
        <div className="mx-4 mb-3 bg-emerald-50 rounded-xl px-3 py-2 flex items-center gap-2">
          <span className="text-base">⚡</span>
          <span className="text-[12px] font-semibold text-emerald-700">
            {order.deliveryTime}
          </span>
        </div>
      )}

      {/* ── Divider ── */}
      <div className="mx-4 border-t border-dashed border-gray-100 mb-3" />

      {/* ── Items preview ── */}
      <div className="px-4 flex flex-col gap-3">
        {(expanded ? order.items : previewItems).map((item) => (
          <OrderItemRow key={item.id} item={item} />
        ))}
      </div>

      {/* Show more / less toggle */}
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
              <ChevronDown size={14} /> +{hiddenCount} more item
              {hiddenCount > 1 ? "s" : ""}
            </>
          )}
        </button>
      )}

      {/* ── Divider ── */}
      <div className="mx-4 mt-4 border-t border-gray-100" />

      {/* ── Bill summary ── */}
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

      {/* ── Address ── */}
      <div className="mx-4 mb-3 bg-gray-50 rounded-xl px-3 py-2.5 flex items-start gap-2">
        <span className="text-sm mt-0.5">📍</span>
        <p className="text-[11.5px] text-gray-500 leading-snug">{order.address}</p>
      </div>

      {/* ── Actions ── */}
      <div className="px-4 pb-4 flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-emerald-500 text-emerald-600 text-[13px] font-semibold active:scale-95 transition-transform">
          <RotateCcw size={14} />
          Reorder
        </button>
        <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-[13px] font-semibold active:scale-95 transition-transform">
          <HelpCircle size={14} />
          Help
        </button>
      </div>
    </div>
  );
}