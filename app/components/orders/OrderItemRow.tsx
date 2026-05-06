"use client";

import Image from "next/image";
import { optimizeCld } from "@/lib/cloudinary-optimize";

export interface OrderItem {
  id: string;
  productId: string;
  slug: string;
  name: string;
  qty: number;
  unit: string;
  quantityValue: number | null;
  price: number;
  emoji: string;
  bg: string;
  imageUrl: string | null;
}

export default function OrderItemRow({ item }: { item: OrderItem }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 overflow-hidden relative ${
          item.imageUrl ? "bg-gray-50" : item.bg
        }`}
      >
        {item.imageUrl ? (
          <Image
            src={optimizeCld(item.imageUrl, { width: 80 })}
            alt={item.name}
            fill
            sizes="44px"
            className="object-cover"
          />
        ) : (
          item.emoji
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-gray-800 truncate">{item.name}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">
          {item.qty} × {item.unit}
        </p>
      </div>

      <p className="text-[13px] font-bold text-gray-800 shrink-0">₹{item.price}</p>
    </div>
  );
}
