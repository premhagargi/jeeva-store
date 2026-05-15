"use client";

import { useState, useTransition } from "react";
import { Truck, Check, X, Phone, MapPin, ChevronDown, ChevronUp, Printer, MessageCircle } from "lucide-react";
import { updateOrderStatus } from "./actions";
import type { OrderStatus } from "@prisma/client";

export interface AdminOrder {
  id: string;
  shortId: string;
  status: OrderStatus;
  phone: string;
  customerName: string | null;
  address: string;
  total: number;
  createdAt: string;
  itemCount: number;
  items: Array<{ name: string; qty: number; unit: string; price: number }>;
}

function buildWhatsAppLink(order: AdminOrder): string {
  const lines = [
    `Hi ${order.customerName ?? "Customer"}, this is about your Jeeva Mart order.`,
    "",
    `Order #${order.shortId}`,
    `${order.itemCount} item${order.itemCount > 1 ? "s" : ""} · ₹${order.total}`,
    "",
    ...order.items.map((it) => `• ${it.name} × ${it.qty} — ₹${it.price * it.qty}`),
    "",
    `Delivery: ${order.address}`,
  ];
  const text = encodeURIComponent(lines.join("\n"));
  const phone = order.phone.replace(/\D/g, "");
  const number = phone.length === 10 ? `91${phone}` : phone;
  return `https://wa.me/${number}?text=${text}`;
}

const STATUS_STYLE: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  PROCESSING: { bg: "bg-amber-50", text: "text-amber-700", label: "New order" },
  OUT_FOR_DELIVERY: { bg: "bg-blue-50", text: "text-blue-700", label: "Dispatched" },
  DELIVERED: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Delivered" },
  CANCELLED: { bg: "bg-red-50", text: "text-red-600", label: "Cancelled" },
};

const STATUS_OPTIONS: Array<{ value: OrderStatus; label: string }> = [
  { value: "PROCESSING", label: "Processing" },
  { value: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function OrderRow({ order }: { order: AdminOrder }) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [pending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(false);

  function changeStatus(next: OrderStatus, requireConfirm = false) {
    if (requireConfirm && !confirm("Cancel this order? This can't be undone.")) return;
    if (next === status) return;
    setStatus(next);
    startTransition(async () => {
      await updateOrderStatus(order.id, next);
    });
  }

  const style = STATUS_STYLE[status];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <a href={`/admin/orders/${order.id}`} className="text-[13px] font-bold text-gray-900 hover:text-emerald-600">#{order.shortId}</a>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
              {style.label}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">{order.createdAt}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[11px] text-gray-400">
            {order.itemCount} item{order.itemCount > 1 ? "s" : ""}
          </p>
          <p className="text-[16px] font-bold text-gray-900">₹{order.total}</p>
        </div>
      </div>

      <div className="px-4 pb-3 flex flex-col gap-1.5">
        <p className="text-[13px] font-semibold text-gray-900">
          {order.customerName ?? "Customer"}
        </p>
        <a
          href={`tel:${order.phone}`}
          className="flex items-center gap-1.5 text-[12px] text-emerald-600 font-semibold w-fit"
        >
          <Phone size={12} />
          {order.phone}
        </a>
        <p className="text-[11px] text-gray-500 leading-snug flex items-start gap-1.5">
          <MapPin size={12} className="text-gray-400 mt-0.5 shrink-0" />
          {order.address}
        </p>
      </div>

      <div className="border-t border-gray-100 grid grid-cols-3 divide-x divide-gray-100">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="px-3 py-2.5 flex items-center justify-center gap-1 text-[12px] font-semibold text-gray-600 active:bg-gray-50"
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {expanded ? "Hide" : "Items"}
        </button>
        <a
          href={`/admin/orders/${order.id}/print`}
          target="_blank"
          rel="noopener"
          className="px-3 py-2.5 flex items-center justify-center gap-1 text-[12px] font-semibold text-gray-600 active:bg-gray-50"
        >
          <Printer size={13} />
          Print
        </a>
        <a
          href={buildWhatsAppLink(order)}
          target="_blank"
          rel="noopener"
          className="px-3 py-2.5 flex items-center justify-center gap-1 text-[12px] font-semibold text-emerald-600 active:bg-emerald-50"
        >
          <MessageCircle size={13} />
          WhatsApp
        </a>
      </div>

      {expanded && (
        <div className="px-4 py-3 border-t border-gray-100 flex flex-col gap-1.5 bg-gray-50">
          {order.items.map((it, i) => (
            <div key={i} className="flex justify-between text-[12px]">
              <span className="text-gray-700 truncate">
                {it.name} <span className="text-gray-400">× {it.qty}</span>
              </span>
              <span className="text-gray-900 font-semibold">₹{it.price * it.qty}</span>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-gray-100 p-3 flex flex-col gap-2">
        <label className="flex items-center justify-between gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Status
          </span>
          <select
            value={status}
            disabled={pending}
            onChange={(e) => {
              const next = e.target.value as OrderStatus;
              const requireConfirm = next === "CANCELLED";
              changeStatus(next, requireConfirm);
            }}
            className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-[13px] font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-emerald-200 disabled:opacity-60"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        {status === "PROCESSING" && (
          <>
            <button
              onClick={() => changeStatus("OUT_FOR_DELIVERY")}
              disabled={pending}
              className="w-full bg-blue-500 text-white font-bold text-[14px] py-3 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-60"
            >
              <Truck size={16} />
              Mark Dispatched
            </button>
            <button
              onClick={() => changeStatus("CANCELLED", true)}
              disabled={pending}
              className="text-[12px] font-semibold text-red-500 py-1.5 active:opacity-70"
            >
              Cancel order
            </button>
          </>
        )}

        {status === "OUT_FOR_DELIVERY" && (
          <>
            <button
              onClick={() => changeStatus("DELIVERED")}
              disabled={pending}
              className="w-full bg-emerald-500 text-white font-bold text-[14px] py-3 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-60"
            >
              <Check size={16} />
              Mark Delivered
            </button>
            <button
              onClick={() => changeStatus("PROCESSING")}
              disabled={pending}
              className="text-[12px] font-semibold text-gray-500 py-1.5 active:opacity-70"
            >
              ← Back to processing
            </button>
          </>
        )}

        {status === "DELIVERED" && (
          <div className="w-full bg-emerald-50 text-emerald-700 font-bold text-[14px] py-3 rounded-xl flex items-center justify-center gap-2">
            <Check size={16} />
            Delivered
          </div>
        )}

        {status === "CANCELLED" && (
          <div className="w-full bg-red-50 text-red-600 font-bold text-[14px] py-3 rounded-xl flex items-center justify-center gap-2">
            <X size={16} />
            Cancelled
          </div>
        )}
      </div>
    </div>
  );
}
