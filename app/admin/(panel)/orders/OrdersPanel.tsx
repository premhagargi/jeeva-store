"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search } from "lucide-react";
import OrdersList from "./OrdersList";
import type { AdminOrder } from "./OrderRow";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "processing", label: "Processing" },
  { key: "out", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

const POLL_MS = 8000;

export default function OrdersPanel({
  initialOrders,
  initialFilter,
  initialQ,
}: {
  initialOrders: AdminOrder[];
  initialFilter: string;
  initialQ: string;
}) {
  const [filter, setFilter] = useState(initialFilter);
  const [q, setQ] = useState(initialQ);
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [tabLoading, setTabLoading] = useState(false);
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set());
  const knownIdsRef = useRef(new Set(initialOrders.map((o) => o.id)));
  const filterRef = useRef(filter);
  const qRef = useRef(q);

  // Keep refs in sync for use inside intervals/callbacks
  filterRef.current = filter;
  qRef.current = q;

  const applyOrders = useCallback((data: AdminOrder[], flash: boolean) => {
    setOrders(data);
    if (flash) {
      const newIds = data.map((o) => o.id).filter((id) => !knownIdsRef.current.has(id));
      knownIdsRef.current = new Set(data.map((o) => o.id));
      if (newIds.length > 0) {
        setFlashIds((prev) => {
          const next = new Set(prev);
          for (const id of newIds) next.add(id);
          return next;
        });
        setTimeout(() => {
          setFlashIds((prev) => {
            const next = new Set(prev);
            for (const id of newIds) next.delete(id);
            return next;
          });
        }, 4000);
      }
    } else {
      knownIdsRef.current = new Set(data.map((o) => o.id));
    }
  }, []);

  const fetchOrders = useCallback(
    async (f: string, query: string, flash = false) => {
      const params = new URLSearchParams({ filter: f });
      if (query) params.set("q", query);
      try {
        const res = await fetch(`/api/admin/orders?${params}`, { cache: "no-store" });
        if (!res.ok) return;
        const data: { orders: AdminOrder[] } = await res.json();
        applyOrders(data.orders, flash);
      } catch {
        // network blip — try again next poll
      }
    },
    [applyOrders],
  );

  // Sync when server re-renders with new props (e.g., search form submit)
  useEffect(() => {
    setOrders(initialOrders);
    setFilter(initialFilter);
    setQ(initialQ);
    knownIdsRef.current = new Set(initialOrders.map((o) => o.id));
  }, [initialOrders, initialFilter, initialQ]);

  // Polling
  useEffect(() => {
    let cancelled = false;
    const interval = setInterval(() => {
      if (!cancelled) fetchOrders(filterRef.current, qRef.current, true);
    }, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible" && !cancelled) {
        fetchOrders(filterRef.current, qRef.current, true);
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [fetchOrders]);

  async function switchFilter(next: string) {
    if (next === filter) return;
    setFilter(next);
    setTabLoading(true);
    // Update URL without triggering a server re-render
    const params = new URLSearchParams({ filter: next });
    if (qRef.current) params.set("q", qRef.current);
    window.history.replaceState(null, "", `/admin/orders?${params}`);
    await fetchOrders(next, qRef.current);
    setTabLoading(false);
  }

  return (
    <div className="px-4 py-4 flex flex-col gap-4">
      <form action="/admin/orders" method="get" className="flex flex-col gap-2">
        <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-2.5 shadow-sm">
          <Search size={16} className="text-gray-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by phone, name, or order ID..."
            className="flex-1 bg-transparent text-[14px] text-gray-800 outline-none"
          />
          <input type="hidden" name="filter" value={filter} />
        </div>
      </form>

      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 flex-1">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => switchFilter(f.key)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${
                  active
                    ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200"
                    : "bg-white border border-gray-200 text-gray-600"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <span className="shrink-0 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
          <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${tabLoading ? "" : "animate-pulse"}`} />
          {tabLoading ? "Loading…" : "Live"}
        </span>
      </div>

      {q && (
        <p className="text-[12px] text-gray-500">
          {orders.length} match{orders.length === 1 ? "" : "es"} for &ldquo;{q}&rdquo;
        </p>
      )}

      <OrdersList orders={orders} flashIds={flashIds} dimmed={tabLoading} />
    </div>
  );
}
