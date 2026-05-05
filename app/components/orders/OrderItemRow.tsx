"use client";

export interface OrderItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  price: number;
  emoji: string;
  bg: string;
}

export default function OrderItemRow({ item }: { item: OrderItem }) {
  return (
    <div className="flex items-center gap-3">
      {/* Emoji thumbnail */}
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${item.bg}`}
      >
        {item.emoji}
      </div>

      {/* Name + qty */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-gray-800 truncate">
          {item.name}
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5">
          {item.qty} × {item.unit}
        </p>
      </div>

      {/* Price */}
      <p className="text-[13px] font-bold text-gray-800 shrink-0">
        ₹{item.price}
      </p>
    </div>
  );
}