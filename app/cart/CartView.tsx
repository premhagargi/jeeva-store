"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, ChevronRight, MapPin, AlertCircle, Check, Plus, X } from "lucide-react";
import CartItemRow from "../components/cart/CartItemRow";
import CartSkeleton from "../components/cart/CartSkeleton";
import { useCart, increment, decrement } from "@/lib/cart";
import { getStoredPhone, getSelectedAddressId, setSelectedAddressId } from "@/lib/customer";

interface CartViewProps {
  minOrderValue: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  storeOpen: boolean;
}

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
  createdAt: string;
};

function pickOldest(list: SavedAddress[]): SavedAddress | null {
  if (list.length === 0) return null;
  return [...list].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )[0];
}

export default function CartView({
  minOrderValue,
  deliveryFee,
  freeDeliveryThreshold,
  storeOpen,
}: CartViewProps) {
  const items = useCart();
  const [hydrated, setHydrated] = useState(false);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedId, setSelectedIdState] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [phone, setPhone] = useState<string | null>(null);

  useEffect(() => {
    setHydrated(true);
    const p = getStoredPhone();
    setPhone(p);
    if (!p) return;
    (async () => {
      try {
        const res = await fetch(`/api/addresses?phone=${encodeURIComponent(p)}`);
        if (!res.ok) return;
        const data = await res.json();
        const list: SavedAddress[] = data.addresses ?? [];
        setAddresses(list);
        const stored = getSelectedAddressId();
        const valid = stored && list.find((a) => a.id === stored);
        if (valid) {
          setSelectedIdState(stored);
        } else {
          const oldest = pickOldest(list);
          if (oldest) {
            setSelectedIdState(oldest.id);
            setSelectedAddressId(oldest.id);
          }
        }
      } catch {}
    })();
  }, []);

  function chooseAddress(id: string) {
    setSelectedIdState(id);
    setSelectedAddressId(id);
    setPicking(false);
  }

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

  const selected = addresses.find((a) => a.id === selectedId) ?? null;

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
        <AddressCard
          phone={phone}
          selected={selected}
          hasAddresses={addresses.length > 0}
          onChange={() => setPicking(true)}
        />

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

      {picking && (
        <AddressPickerSheet
          addresses={addresses}
          selectedId={selectedId}
          onClose={() => setPicking(false)}
          onSelect={chooseAddress}
        />
      )}
    </div>
  );
}

function AddressCard({
  phone,
  selected,
  hasAddresses,
  onChange,
}: {
  phone: string | null;
  selected: SavedAddress | null;
  hasAddresses: boolean;
  onChange: () => void;
}) {
  if (!phone) {
    return (
      <Link
        href="/account"
        className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm border border-gray-100 active:bg-gray-50"
      >
        <MapPin size={18} className="text-emerald-500" />
        <div className="flex-1">
          <p className="text-[13px] font-bold text-gray-900">Add phone & address</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Required for delivery</p>
        </div>
        <ChevronRight size={16} className="text-gray-300" />
      </Link>
    );
  }

  if (!selected) {
    return (
      <Link
        href="/account/addresses"
        className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm border border-gray-100 active:bg-gray-50"
      >
        <MapPin size={18} className="text-emerald-500" />
        <div className="flex-1">
          <p className="text-[13px] font-bold text-gray-900">
            {hasAddresses ? "Select delivery address" : "Add a delivery address"}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">Tap to {hasAddresses ? "choose" : "add"}</p>
        </div>
        <ChevronRight size={16} className="text-gray-300" />
      </Link>
    );
  }

  return (
    <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
        <MapPin size={15} className="text-emerald-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Delivering to {selected.label || "Address"}
          </p>
          {selected.isDefault && (
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              Default
            </span>
          )}
        </div>
        <p className="text-[13px] text-gray-700 line-clamp-2">
          {selected.line1}
          {selected.line2 ? `, ${selected.line2}` : ""}
          {selected.city ? `, ${selected.city}` : ""}
          {selected.pincode ? ` ${selected.pincode}` : ""}
        </p>
      </div>
      <button
        onClick={onChange}
        className="text-[12px] font-bold text-emerald-600 px-2 py-1 rounded-lg active:bg-emerald-50 shrink-0"
      >
        Change
      </button>
    </div>
  );
}

function AddressPickerSheet({
  addresses,
  selectedId,
  onClose,
  onSelect,
}: {
  addresses: SavedAddress[];
  selectedId: string | null;
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] bg-black/40 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-bold text-gray-900">Select address</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {addresses.map((a) => {
            const isSelected = a.id === selectedId;
            return (
              <button
                key={a.id}
                onClick={() => onSelect(a.id)}
                className={`text-left rounded-xl border p-3 transition-all ${
                  isSelected
                    ? "border-emerald-400 bg-emerald-50/60 shadow-sm"
                    : "border-gray-100 bg-gray-50 active:bg-gray-100"
                }`}
              >
                <div className="flex items-start gap-2">
                  <MapPin
                    size={14}
                    className={isSelected ? "text-emerald-600 mt-0.5" : "text-gray-400 mt-0.5"}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
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
                      {a.line1}
                      {a.line2 ? `, ${a.line2}` : ""}
                      {a.city ? `, ${a.city}` : ""}
                      {a.pincode ? ` ${a.pincode}` : ""}
                    </p>
                  </div>
                  {isSelected && <Check size={16} className="text-emerald-600 shrink-0" />}
                </div>
              </button>
            );
          })}

          <Link
            href="/account/addresses"
            className="flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 text-emerald-600 text-[13px] font-semibold active:scale-[0.98]"
          >
            <Plus size={14} /> Add new address
          </Link>
        </div>
      </div>
    </div>
  );
}
