"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { ChevronLeft, MapPin, Check, Plus } from "lucide-react";
import { useCart, clearCart } from "@/lib/cart";
import { getStoredPhone, setStoredPhone } from "@/lib/customer";
import { placeOrder } from "./actions";

type SavedAddress = {
  id: string;
  label: string | null;
  fullName: string | null;
  line1: string;
  line2: string | null;
  landmark: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  isDefault: boolean;
};

function formatAddress(a: SavedAddress): string {
  return [a.line1, a.line2, a.landmark && `Landmark: ${a.landmark}`, [a.city, a.state, a.pincode].filter(Boolean).join(", ")]
    .filter(Boolean)
    .join("\n");
}

export default function CheckoutPage() {
  const items = useCart();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [useManual, setUseManual] = useState(false);

  useEffect(() => {
    const stored = getStoredPhone();
    if (stored) setPhone(stored);
  }, []);

  useEffect(() => {
    const p = phone.trim();
    if (!p) {
      setSavedAddresses([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [cRes, aRes] = await Promise.all([
          fetch(`/api/customer?phone=${encodeURIComponent(p)}`),
          fetch(`/api/addresses?phone=${encodeURIComponent(p)}`),
        ]);
        if (cancelled) return;
        if (cRes.ok) {
          const data = await cRes.json();
          if (data.customer?.name && !name) setName(data.customer.name);
        }
        if (aRes.ok) {
          const data = await aRes.json();
          const list: SavedAddress[] = data.addresses ?? [];
          setSavedAddresses(list);
          if (list.length > 0 && !selectedId && !useManual) {
            const def = list.find((a) => a.isDefault) ?? list[0];
            setSelectedId(def.id);
            setAddress(formatAddress(def));
            if (def.fullName && !name) setName(def.fullName);
          }
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [phone]); // eslint-disable-line react-hooks/exhaustive-deps

  function selectSaved(a: SavedAddress) {
    setSelectedId(a.id);
    setUseManual(false);
    setAddress(formatAddress(a));
    if (a.fullName) setName(a.fullName);
  }

  function chooseManual() {
    setUseManual(true);
    setSelectedId(null);
    setAddress("");
  }

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
          notes,
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

  const showAddressList = savedAddresses.length > 0 && !useManual;

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

      <form id="checkout-form" onSubmit={handleSubmit} className="px-4 py-4 flex flex-col gap-4">
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
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-bold text-gray-900">Delivery address</p>
            {savedAddresses.length > 0 && (
              <Link
                href="/account/addresses"
                className="text-[11px] font-semibold text-emerald-600"
              >
                Manage
              </Link>
            )}
          </div>

          {showAddressList ? (
            <div className="flex flex-col gap-2">
              {savedAddresses.map((a) => {
                const selected = selectedId === a.id;
                return (
                  <button
                    type="button"
                    key={a.id}
                    onClick={() => selectSaved(a)}
                    className={`text-left rounded-xl border p-3 transition-all ${
                      selected
                        ? "border-emerald-400 bg-emerald-50/60 shadow-sm"
                        : "border-gray-100 bg-gray-50 active:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className={selected ? "text-emerald-600 mt-0.5" : "text-gray-400 mt-0.5"} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[13px] font-bold text-gray-900">
                            {a.label || "Address"}
                          </span>
                          {a.isDefault && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-gray-600 line-clamp-2">
                          {a.line1}{a.line2 ? `, ${a.line2}` : ""}
                          {a.city ? `, ${a.city}` : ""}{a.pincode ? ` ${a.pincode}` : ""}
                        </p>
                      </div>
                      {selected && <Check size={16} className="text-emerald-600" />}
                    </div>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={chooseManual}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-gray-200 text-[12px] font-semibold text-gray-500 active:bg-gray-50"
              >
                <Plus size={14} /> Use a different address
              </button>
            </div>
          ) : (
            <>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House/flat, street, area, landmark"
                rows={3}
                className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] text-gray-800 outline-none focus:ring-2 focus:ring-emerald-200 resize-none"
                required
              />
              {savedAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => { setUseManual(false); const def = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0]; selectSaved(def); }}
                  className="text-[12px] font-semibold text-emerald-600 self-start"
                >
                  ← Pick a saved address
                </button>
              )}
            </>
          )}

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Delivery notes (optional, e.g. ring 2nd bell)"
            rows={2}
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[13px] text-gray-800 outline-none focus:ring-2 focus:ring-emerald-200 resize-none"
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
      </form>

      <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto px-4 z-40">
        <button
          type="submit"
          form="checkout-form"
          disabled={isPending}
          className="w-full bg-emerald-500 text-white rounded-2xl py-4 flex items-center justify-between px-5 shadow-xl shadow-emerald-300/50 active:scale-[0.98] transition-transform disabled:opacity-60"
        >
          <div className="text-left">
            <p className="text-[11px] font-medium opacity-80">
              {items.length} item{items.length > 1 ? "s" : ""}
            </p>
            <p className="text-[16px] font-bold">₹{itemTotal}</p>
          </div>
          <div className="text-[14px] font-bold">
            {isPending ? "Placing..." : "Place Order"}
          </div>
        </button>
      </div>
    </div>
  );
}
