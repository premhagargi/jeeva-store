"use client";

import OrderRow, { AdminOrder } from "./OrderRow";

export default function OrdersList({
  orders,
  flashIds,
  dimmed = false,
}: {
  orders: AdminOrder[];
  flashIds: Set<string>;
  dimmed?: boolean;
}) {
  if (orders.length === 0) {
    return (
      <p className="text-center text-[13px] text-gray-400 py-12">No orders.</p>
    );
  }

  return (
    <div className={`flex flex-col gap-3 transition-opacity duration-150 ${dimmed ? "opacity-50 pointer-events-none" : ""}`}>
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
