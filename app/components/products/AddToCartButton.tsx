"use client";

import Link from "next/link";
import { Plus, Minus, ShoppingCart, ChevronRight } from "lucide-react";
import { useCart, addToCart, increment, decrement } from "@/lib/cart";

interface Props {
  productId: string;
  slug: string;
  name: string;
  unit: string;
  quantityValue: number | null;
  price: number;
  emoji: string;
  bg: string;
  imageUrl: string | null;
  isAvailable: boolean;
}

export default function AddToCartButton(props: Props) {
  const cart = useCart();
  const qty = cart.find((l) => l.productId === props.productId)?.qty ?? 0;

  if (!props.isAvailable) {
    return (
      <button
        disabled
        className="w-full bg-gray-100 text-gray-400 font-semibold py-3 rounded-xl text-[14px]"
      >
        Out of stock
      </button>
    );
  }

  if (qty === 0) {
    return (
      <button
        onClick={() =>
          addToCart({
            productId: props.productId,
            slug: props.slug,
            name: props.name,
            unit: props.unit,
            quantityValue: props.quantityValue,
            price: props.price,
            emoji: props.emoji,
            bg: props.bg,
            imageUrl: props.imageUrl,
          })
        }
        className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl text-[14px] shadow-md shadow-emerald-200 active:scale-[0.98] transition-transform"
      >
        Add to Cart
      </button>
    );
  }

  return (
    <div className="flex items-stretch gap-2">
      <div className="flex items-center bg-white border-2 border-emerald-500 rounded-xl px-1 py-1 shrink-0">
        <button
          onClick={() => decrement(props.productId)}
          aria-label="Decrease quantity"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-emerald-600 active:bg-emerald-50 active:scale-90 transition-all"
        >
          <Minus size={16} />
        </button>
        <span className="min-w-[24px] text-center text-emerald-700 font-bold text-[15px] tabular-nums">
          {qty}
        </span>
        <button
          onClick={() => increment(props.productId)}
          aria-label="Increase quantity"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-emerald-600 active:bg-emerald-50 active:scale-90 transition-all"
        >
          <Plus size={16} />
        </button>
      </div>

      <Link
        href="/cart"
        className="flex-1 bg-emerald-500 text-white font-bold rounded-xl text-[14px] shadow-md shadow-emerald-200 active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5"
      >
        <ShoppingCart size={16} />
        Go to Cart
        <ChevronRight size={16} />
      </Link>
    </div>
  );
}
