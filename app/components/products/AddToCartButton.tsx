"use client";

import { Plus, Minus } from "lucide-react";
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
    <div className="flex items-center justify-between bg-emerald-500 rounded-xl px-2 py-2">
      <button
        onClick={() => decrement(props.productId)}
        className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white active:scale-90 transition-transform"
      >
        <Minus size={16} />
      </button>
      <span className="text-white font-bold text-[15px]">{qty} in cart</span>
      <button
        onClick={() => increment(props.productId)}
        className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white active:scale-90 transition-transform"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
