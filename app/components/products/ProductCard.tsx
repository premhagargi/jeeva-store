"use client";

import Link from "next/link";
import Image from "next/image";
import { Plus, Minus } from "lucide-react";
import { useCart, addToCart, increment, decrement } from "@/lib/cart";
import { optimizeCld } from "@/lib/cloudinary-optimize";

export interface ProductCardData {
  id: string;
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

export default function ProductCard({ product }: { product: ProductCardData }) {
  const cart = useCart();
  const qty = cart.find((l) => l.productId === product.id)?.qty ?? 0;
  const qtyLabel =
    product.quantityValue != null ? `${product.quantityValue} ${product.unit}` : product.unit;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      <Link href={`/product/${product.slug}`} className="block">
        <div
          className={`w-full aspect-square flex items-center justify-center text-4xl overflow-hidden relative ${
            product.imageUrl ? "bg-gray-50" : product.bg
          }`}
        >
          {product.imageUrl ? (
            <Image
              src={optimizeCld(product.imageUrl, { width: 320 })}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 200px"
              className="object-cover"
            />
          ) : (
            product.emoji
          )}
        </div>
        <div className="px-2.5 pt-2">
          <p className="text-[12.5px] font-semibold text-gray-800 leading-snug line-clamp-2 min-h-[34px]">
            {product.name}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">{qtyLabel}</p>
        </div>
      </Link>

      <div className="flex items-center justify-between mt-2 px-2.5 pb-2.5">
        <span className="text-[14px] font-bold text-gray-900">₹{product.price}</span>

        {qty === 0 ? (
          <button
            disabled={!product.isAvailable}
            onClick={() =>
              addToCart({
                productId: product.id,
                slug: product.slug,
                name: product.name,
                unit: product.unit,
                quantityValue: product.quantityValue,
                price: product.price,
                emoji: product.emoji,
                bg: product.bg,
                imageUrl: product.imageUrl,
              })
            }
            className="text-[12px] font-bold text-emerald-600 border border-emerald-200 bg-emerald-50 px-3 py-1.5 rounded-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ADD
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button
              onClick={() => decrement(product.id)}
              className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 active:scale-90 transition-transform"
            >
              <Minus size={12} />
            </button>
            <span className="w-5 text-center text-[12px] font-bold text-gray-800">{qty}</span>
            <button
              onClick={() => increment(product.id)}
              className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white active:scale-90 transition-transform"
            >
              <Plus size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
