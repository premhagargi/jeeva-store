"use client";

export type OrderStatus =
  | "delivered"
  | "out_for_delivery"
  | "processing"
  | "cancelled";

const config: Record<
  OrderStatus,
  { label: string; color: string; dot: string }
> = {
  delivered: {
    label: "Delivered",
    color: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    color: "bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  processing: {
    label: "Processing",
    color: "bg-amber-50 text-amber-700",
    dot: "bg-amber-400",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-50 text-red-600",
    dot: "bg-red-400",
  },
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, color, dot } = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}