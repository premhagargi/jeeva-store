"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Tag, ChevronRight, MapPin } from "lucide-react";
import CartItemRow, { CartItem } from "../components/cart/CartItemRow";

// ── Mock cart data ─────────────────────────────────────────────────────────────
const INITIAL_ITEMS: CartItem[] = [
  { id: "1", name: "Amul Full Cream Milk",  unit: "500 ml",  price: 29,  originalPrice: 32,  emoji: "🥛", bg: "bg-yellow-50", qty: 2 },
  { id: "2", name: "Whole Wheat Bread",     unit: "400 g",   price: 42,  originalPrice: undefined, emoji: "🍞", bg: "bg-amber-50",  qty: 1 },
  { id: "3", name: "Farm Fresh Eggs",       unit: "6 pcs",   price: 65,  originalPrice: 72,  emoji: "🥚", bg: "bg-orange-50", qty: 1 },
  { id: "4", name: "Maggi Noodles",         unit: "70 g × 4",price: 72,  originalPrice: 80,  emoji: "🍜", bg: "bg-red-50",    qty: 1 },
  { id: "5", name: "Aashirvaad Atta",       unit: "5 kg",    price: 270, originalPrice: undefined, emoji: "🌾", bg: "bg-green-50", qty: 1 },
];

const DELIVERY_FEE = 0;      // free delivery
const COUPON_DISCOUNT = 30;  // mock applied coupon

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(INITIAL_ITEMS);

  const increment = (id: string) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i))
    );

  const decrement = (id: string) =>
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0)
    );

  const itemTotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const savings   = items.reduce(
    (s, i) => s + (i.originalPrice ? (i.originalPrice - i.price) * i.qty : 0),
    0
  );
  const grandTotal = itemTotal + DELIVERY_FEE - COUPON_DISCOUNT;

  // ── Empty cart ──────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-24 h-24 rounded-3xl bg-emerald-50 flex items-center justify-center text-5xl mb-5">
          🛒
        </div>
        <h2 className="text-[18px] font-bold text-gray-800 mb-2">
          Your cart is empty
        </h2>
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
      {/* ── Header ── */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-2">
        <ShoppingCart size={20} className="text-emerald-500" />
        <h1 className="text-[18px] font-bold text-gray-900">My Cart</h1>
        <span className="ml-1 text-[12px] font-semibold text-gray-400">
          ({items.length} item{items.length > 1 ? "s" : ""})
        </span>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        {/* ── Delivery info ── */}
        <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm border border-gray-100">
          <span className="text-xl">⚡</span>
          <div>
            <p className="text-[13px] font-bold text-gray-800">
              Delivery in 8 minutes
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
              <MapPin size={10} />
              Bhagya Nagar, 3rd Cross, Gokak
            </p>
          </div>
        </div>

        {/* ── Items card ── */}
        <div className="bg-white rounded-2xl px-4 shadow-sm border border-gray-100 divide-y divide-gray-100">
          {items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onIncrement={increment}
              onDecrement={decrement}
            />
          ))}
        </div>

        {/* ── Coupon ── */}
        <div className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm border border-gray-100">
          <Tag size={16} className="text-emerald-500 shrink-0" />
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-gray-800">
              NEWUSER30 applied
            </p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
              You save ₹{COUPON_DISCOUNT} with this coupon 🎉
            </p>
          </div>
          <button className="text-[12px] font-semibold text-red-400">
            Remove
          </button>
        </div>

        {/* ── Bill summary ── */}
        <div className="bg-white rounded-2xl px-4 py-4 shadow-sm border border-gray-100">
          <p className="text-[14px] font-bold text-gray-900 mb-3">
            Bill Summary
          </p>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-[13px] text-gray-500">
              <span>Item total</span>
              <span>₹{itemTotal}</span>
            </div>

            {savings > 0 && (
              <div className="flex justify-between text-[13px] text-emerald-600 font-medium">
                <span>Product savings</span>
                <span>− ₹{savings}</span>
              </div>
            )}

            <div className="flex justify-between text-[13px] text-gray-500">
              <span>Delivery fee</span>
              <span className={DELIVERY_FEE === 0 ? "text-emerald-600 font-medium" : ""}>
                {DELIVERY_FEE === 0 ? "FREE" : `₹${DELIVERY_FEE}`}
              </span>
            </div>

            <div className="flex justify-between text-[13px] text-emerald-600 font-medium">
              <span>Coupon discount</span>
              <span>− ₹{COUPON_DISCOUNT}</span>
            </div>

            <div className="border-t border-dashed border-gray-100 my-1" />

            <div className="flex justify-between text-[15px] font-bold text-gray-900">
              <span>To pay</span>
              <span>₹{grandTotal}</span>
            </div>

            {(savings > 0 || COUPON_DISCOUNT > 0) && (
              <div className="mt-1 bg-emerald-50 rounded-xl px-3 py-2 text-center text-[12px] font-semibold text-emerald-700">
                🎉 You're saving ₹{savings + COUPON_DISCOUNT} on this order!
              </div>
            )}
          </div>
        </div>

        {/* ── Payment method ── */}
        <div className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm border border-gray-100">
          <span className="text-xl">💳</span>
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-gray-800">
              Pay on Delivery
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">Cash / UPI on delivery</p>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </div>
      </div>

      {/* ── Sticky checkout bar ── */}
      <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto px-4 z-50">
        <button className="w-full bg-emerald-500 text-white rounded-2xl py-4 flex items-center justify-between px-5 shadow-xl shadow-emerald-300/50 active:scale-[0.98] transition-transform">
          <div className="text-left">
            <p className="text-[11px] font-medium opacity-80">
              {items.length} item{items.length > 1 ? "s" : ""}
            </p>
            <p className="text-[16px] font-bold">₹{grandTotal}</p>
          </div>
          <div className="flex items-center gap-1 text-[14px] font-bold">
            Place Order
            <ChevronRight size={18} />
          </div>
        </button>
      </div>
    </div>
  );
}