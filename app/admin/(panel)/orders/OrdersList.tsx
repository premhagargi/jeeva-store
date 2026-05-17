"use client";

import { useEffect, useRef, useState } from "react";
import OrderRow, { AdminOrder } from "./OrderRow";

const POLL_MS = 8000;

export default function OrdersList({
  initialOrders,
  filter,
  q,
}: {
  initialOrders: AdminOrder[];
  filter: string;
  q: string;
}) {
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set());
  const knownIdsRef = useRef<Set<string>>(new Set(initialOrders.map((o) => o.id)));

  useEffect(() => {
    setOrders(initialOrders);
    knownIdsRef.current = new Set(initialOrders.map((o) => o.id));
  }, [initialOrders]);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const params = new URLSearchParams({ filter });
        if (q) params.set("q", q);
        const res = await fetch(`/api/admin/orders?${params.toString()}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data: { orders: AdminOrder[] } = await res.json();
        if (cancelled) return;

        const newIds = data.orders
          .map((o) => o.id)
          .filter((id) => !knownIdsRef.current.has(id));

        setOrders(data.orders);

        if (newIds.length > 0) {
          knownIdsRef.current = new Set(data.orders.map((o) => o.id));
          setFlashIds((prev) => {
            const next = new Set(prev);
            for (const id of newIds) next.add(id);
            return next;
          });
          setTimeout(() => {
            if (cancelled) return;
            setFlashIds((prev) => {
              const next = new Set(prev);
              for (const id of newIds) next.delete(id);
              return next;
            });
          }, 4000);
        } else {
          knownIdsRef.current = new Set(data.orders.map((o) => o.id));
        }
      } catch {
        // network blip — just try again next tick
      }
    }

    const interval = setInterval(poll, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") poll();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [filter, q]);

  if (orders.length === 0) {
    return (
      <p className="text-center text-[13px] text-gray-400 py-12">No orders.</p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {orders.map((o) => (
        <div
          key={o.id}
          className={
            flashIds.has(o.id)
              ? "rounded-2xl ring-2 ring-emerald-400 transition-all animate-[pulse_1.5s_ease-in-out_2]"
              : ""
          }
        >
          <OrderRow order={o} />
        </div>
      ))}
    </div>
  );
}
