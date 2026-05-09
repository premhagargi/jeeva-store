"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import OrderCard, { Order } from "../components/orders/OrderCard";
import EmptyOrders from "../components/orders/EmptyOrders";
import PhonePrompt from "./PhonePrompt";
import PhoneSync from "./PhoneSync";
import OrdersSkeleton from "../components/orders/OrdersSkeleton";

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

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone")?.trim() ?? "";
  const placed = searchParams.get("placed");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async (phoneNumber: string) => {
    if (!phoneNumber) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?phone=${encodeURIComponent(phoneNumber)}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(phone);
  }, [phone, fetchOrders]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between gap-2">
          <div>
            <h1 className="text-[20px] font-bold text-gray-900">My Orders</h1>
            <p className="text-[11px] text-gray-400 mt-0.5">{phone}</p>
          </div>
          <PhoneSync currentPhone={phone} />
        </div>
        <OrdersSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-gray-900">My Orders</h1>
          <p className="text-[11px] text-gray-400 mt-0.5">{phone}</p>
        </div>
        <PhoneSync currentPhone={phone} />
      </div>

      {placed && (
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