"use client";

import { Minus, Plus, Trash2 } from "lucide-react";

export interface CartItem {
  id: string;
  name: string;
  unit: string;
  price: number;
  originalPrice?: number;
  emoji: string;
  bg: string;
  qty: number;
}

interface CartItemRowProps {
  item: CartItem;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
}

export default function CartItemRow({
  item,
  onIncrement,
  onDecrement,
}: CartItemRowProps) {
  return (
    <div className="flex items-center gap-3 py-3">
      {/* Emoji thumbnail */}
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${item.bg}`}
      >
        {item.emoji}
      </div>

      {/* Name + unit + price */}
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-semibold text-gray-800 leading-snug truncate">
          {item.name}
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5">{item.unit}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[13px] font-bold text-gray-900">
            ₹{item.price * item.qty}
          </span>
          {item.originalPrice && (
            <span className="text-[11px] text-gray-400 line-through">
              ₹{item.originalPrice * item.qty}
            </span>
          )}
        </div>
      </div>

      {/* Qty stepper */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onDecrement(item.id)}
          className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 active:scale-90 transition-transform"
        >
          {item.qty === 1 ? <Trash2 size={13} /> : <Minus size={13} />}
        </button>
        <span className="w-6 text-center text-[13px] font-bold text-gray-800">
          {item.qty}
        </span>
        <button
          onClick={() => onIncrement(item.id)}
          className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white active:scale-90 transition-transform"
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
}