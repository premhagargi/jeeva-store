"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { ChevronLeft } from "lucide-react";
import { useCart, clearCart } from "@/lib/cart";
import { getStoredPhone, setStoredPhone } from "@/lib/customer";
import { placeOrder } from "./actions";

export default function CheckoutPage() {
  const items = useCart();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const stored = getStoredPhone();
    if (stored) setPhone(stored);
  }, []);

  const itemTotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-8 text-center">
        <p className="text-[14px] text-gray-500 mb-4">Your cart is empty.</p>
        <Link href="/" className="bg-emerald-500 text-white font-semibold text-[14px] px-6 py-2.5 rounded-xl">
          Browse products
        </Link>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const p = phone.trim();
    if (!/^\d{7,15}$/.test(p.replace(/\D/g, ""))) {
      setError("Enter a valid phone number");
      return;
    }
    if (!address.trim()) {
      setError("Enter a delivery address");
      return;
    }

    setStoredPhone(p);

    startTransition(async () => {
      try {
        await placeOrder({
          phone: p,
          name,
          address,
          items: items.map((i) => ({
            productId: i.productId,
            price: i.price,
            qty: i.qty,
          })),
        });
        clearCart();
      } catch (err: any) {
        if (err?.digest?.startsWith?.("NEXT_REDIRECT")) {
          clearCart();
          throw err;
        }
        setError(err?.message ?? "Failed to place order");
      }
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-2">
        <Link
          href="/cart"
          className="w-9 h-9 rounded-xl flex items-center justify-center active:bg-gray-100"
        >
          <ChevronLeft size={20} className="text-gray-700" />
        </Link>
        <h1 className="text-[16px] font-bold text-gray-900">Checkout</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-4 flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
          <p className="text-[14px] font-bold text-gray-900">Contact</p>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] text-gray-800 outline-none focus:ring-2 focus:ring-emerald-200"
            required
          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] text-gray-800 outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
          <p className="text-[14px] font-bold text-gray-900">Delivery address</p>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="House/flat, street, area, landmark"
            rows={3}
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] text-gray-800 outline-none focus:ring-2 focus:ring-emerald-200 resize-none"
            required
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-[14px] font-bold text-gray-900 mb-3">Order summary</p>
          <div className="flex flex-col gap-2">
            {items.map((i) => (
              <div key={i.productId} className="flex justify-between text-[13px]">
                <span className="text-gray-700 truncate">
                  {i.name} <span className="text-gray-400">× {i.qty}</span>
                </span>
                <span className="text-gray-900 font-semibold">₹{i.price * i.qty}</span>
              </div>
            ))}
            <div className="border-t border-dashed border-gray-100 my-1" />
            <div className="flex justify-between text-[13px] text-gray-500">
              <span>Delivery</span>
              <span className="text-emerald-600 font-medium">FREE</span>
            </div>
            <div className="flex justify-between text-[15px] font-bold text-gray-900 mt-1">
              <span>Total</span>
              <span>₹{itemTotal}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <span className="text-xl">💳</span>
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-gray-800">Pay on Delivery</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Cash / UPI on delivery</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-[13px] rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-emerald-500 text-white rounded-2xl py-4 font-bold text-[15px] shadow-xl shadow-emerald-300/50 active:scale-[0.98] transition-transform disabled:opacity-60"
        >
          {isPending ? "Placing order..." : `Place Order · ₹${itemTotal}`}
        </button>
      </form>
    </div>
  );
}
