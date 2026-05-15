"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, ChevronRight, MapPin, AlertCircle } from "lucide-react";
import CartItemRow from "../components/cart/CartItemRow";
import CartSkeleton from "../components/cart/CartSkeleton";
import { useCart, increment, decrement } from "@/lib/cart";

interface CartViewProps {
  minOrderValue: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  storeOpen: boolean;
}

export default function CartView({
  minOrderValue,
  deliveryFee,
  freeDeliveryThreshold,
  storeOpen,
}: CartViewProps) {
  const items = useCart();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return <CartSkeleton />;
  }

  const itemTotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const qualifiesForFree =
    freeDeliveryThreshold > 0 && itemTotal >= freeDeliveryThreshold;
  const effectiveDelivery = qualifiesForFree ? 0 : deliveryFee;
  const grandTotal = itemTotal + effectiveDelivery;
  const belowMin = minOrderValue > 0 && itemTotal < minOrderValue;
  const shortfall = belowMin ? minOrderValue - itemTotal : 0;
  const freeShortfall =
    freeDeliveryThreshold > 0 && !qualifiesForFree && deliveryFee > 0
      ? freeDeliveryThreshold - itemTotal
      : 0;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-24 h-24 rounded-3xl bg-emerald-50 flex items-center justify-center text-5xl mb-5">
          🛒
        </div>
        <h2 className="text-[18px] font-bold text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-[13px] text-gray-400 mb-6 leading-relaxed">
          Add items from the store and they'll appear here.
        </p>
        <Link
          href="/"
          className="bg-emerald-500 text-white font-semibold text-[14px] px-8 py-3 rounded-xl shadow-md shadow-emerald-200 active:scale-95 transition-transform"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-36">
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-2">
        <ShoppingCart size={20} className="text-emerald-500" />
        <h1 className="text-[18px] font-bold text-gray-900">My Cart</h1>
        <span className="ml-1 text-[12px] font-semibold text-gray-400">
          ({items.length} item{items.length > 1 ? "s" : ""})
        </span>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm border border-gray-100">
          <span className="text-xl">⚡</span>
          <div>
            <p className="text-[13px] font-bold text-gray-800">Delivery in 8 minutes</p>
            <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
              <MapPin size={10} />
              Bhagya Nagar, 3rd Cross, Gokak
            </p>
          </div>
        </div>

        {!storeOpen && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-start gap-2.5">
            <AlertCircle size={16} className="text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-[13px] font-bold text-red-800">Store is currently closed</p>
              <p className="text-[11px] text-red-700 mt-0.5">
                You can browse, but checkout is disabled.
              </p>
            </div>
          </div>
        )}

        {belowMin && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-start gap-2.5">
            <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-[13px] font-bold text-amber-800">
                Add ₹{shortfall} more to checkout
              </p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Minimum order value is ₹{minOrderValue}.
              </p>
            </div>
          </div>
        )}

        {freeShortfall > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-2.5">
            <p className="text-[12px] text-blue-800 font-semibold">
              Add ₹{freeShortfall} more for FREE delivery
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl px-4 shadow-sm border border-gray-100 divide-y divide-gray-100">
          {items.map((item) => (
            <CartItemRow
              key={item.productId}
              item={{
                id: item.productId,
                name: item.name,
                unit:
                  item.quantityValue != null
                    ? `${item.quantityValue} ${item.unit}`
                    : item.unit,
                price: item.price,
                emoji: item.emoji,
                bg: item.bg,
                qty: item.qty,
                imageUrl: item.imageUrl,
              }}
              onIncrement={increment}
              onDecrement={decrement}
            />
          ))}
        </div>

        <div className="bg-white rounded-2xl px-4 py-4 shadow-sm border border-gray-100">
          <p className="text-[14px] font-bold text-gray-900 mb-3">Bill Summary</p>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-[13px] text-gray-500">
              <span>Item total</span>
              <span>₹{itemTotal}</span>
            </div>
            <div className="flex justify-between text-[13px] text-gray-500">
              <span>Delivery fee</span>
              <span className={effectiveDelivery === 0 ? "text-emerald-600 font-medium" : ""}>
                {effectiveDelivery === 0 ? "FREE" : `₹${effectiveDelivery}`}
              </span>
            </div>
            <div className="border-t border-dashed border-gray-100 my-1" />
            <div className="flex justify-between text-[15px] font-bold text-gray-900">
              <span>To pay</span>
              <span>₹{grandTotal}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto px-4 z-50">
        {!storeOpen ? (
          <button
            disabled
            className="w-full bg-gray-200 text-gray-500 rounded-2xl py-4 flex items-center justify-center px-5 cursor-not-allowed"
          >
            <span className="text-[14px] font-bold">Store is closed</span>
          </button>
        ) : belowMin ? (
          <button
            disabled
            className="w-full bg-gray-200 text-gray-500 rounded-2xl py-4 flex items-center justify-center px-5 cursor-not-allowed"
          >
            <span className="text-[14px] font-bold">
              Add ₹{shortfall} more to checkout
            </span>
          </button>
        ) : (
          <Link
            href="/checkout"
            className="w-full bg-emerald-500 text-white rounded-2xl py-4 flex items-center justify-between px-5 shadow-xl shadow-emerald-300/50 active:scale-[0.98] transition-transform"
          >
            <div className="text-left">
              <p className="text-[11px] font-medium opacity-80">
                {items.length} item{items.length > 1 ? "s" : ""}
              </p>
              <p className="text-[16px] font-bold">₹{grandTotal}</p>
            </div>
            <div className="flex items-center gap-1 text-[14px] font-bold">
              Checkout
              <ChevronRight size={18} />
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
