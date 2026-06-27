"use client";

import { useState, useTransition, useMemo, useCallback, memo, useDeferredValue } from "react";
import { useRouter } from "next/navigation";
import { createBill } from "../actions";

type ProductOption = {
  id: string;
  name: string;
  price: number;
  stockQty: number;
  unit: string;
  quantityValue: number | null;
  categoryEmoji: string | null;
  categoryName: string;
  isAvailable: boolean;
};

type CartItem = {
  productId: string;
  name: string;
  price: number;
  unit: string;
  quantityValue: number | null;
  stockQty: number;
  qty: number;
};

interface Props {
  products: ProductOption[];
  initialType: "walkin" | "online";
  deliveryFee: number;
  freeDeliveryThreshold: number;
}

function unitLabel(p: { quantityValue: number | null; unit: string }) {
  return p.quantityValue ? `${p.quantityValue}${p.unit}` : p.unit;
}

// Memoised product row — only re-renders when THIS product's qty changes
const ProductRow = memo(function ProductRow({
  product,
  qtyInCart,
  onAdd,
}: {
  product: ProductOption;
  qtyInCart: number;
  onAdd: (p: ProductOption) => void;
}) {
  const outOfStock = product.stockQty === 0;
  return (
    <div className={`flex items-center px-4 py-2.5 gap-3 ${outOfStock ? "opacity-40" : ""}`}>
      {product.categoryEmoji ? (
        <span className="text-lg shrink-0 w-7 text-center">{product.categoryEmoji}</span>
      ) : (
        <span className="w-7 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-gray-800 truncate">{product.name}</p>
        <p className="text-[11px] text-gray-400">
          ₹{product.price} / {unitLabel(product)}
          {outOfStock
            ? " · out of stock"
            : product.stockQty < 10
            ? ` · ${product.stockQty} left`
            : ""}
        </p>
      </div>
      <button
        type="button"
        disabled={outOfStock}
        onClick={() => !outOfStock && onAdd(product)}
        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-[14px] shrink-0 active:scale-95 transition-transform ${
          qtyInCart > 0
            ? "bg-emerald-100 text-emerald-700"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        {qtyInCart > 0 ? qtyInCart : "+"}
      </button>
    </div>
  );
});

export default function BillForm({
  products,
  initialType,
  deliveryFee,
  freeDeliveryThreshold,
}: Props) {
  const router = useRouter();
  const [type, setType] = useState<"walkin" | "online">(initialType);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [discount, setDiscount] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Defer the search so keystrokes are never blocked by list re-renders
  const deferredSearch = useDeferredValue(search);

  const filtered = useMemo(() => {
    const q = deferredSearch.toLowerCase().trim();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q),
    );
  }, [products, deferredSearch]);

  // Stable map: productId → qty. Only changes when cart changes.
  const cartMap = useMemo(
    () => new Map(cart.map((c) => [c.productId, c.qty])),
    [cart],
  );

  // Stable callback — ProductRow rows that aren't in the cart won't re-render
  const addToCart = useCallback((p: ProductOption) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === p.id);
      if (existing) {
        return prev.map((c) =>
          c.productId === p.id
            ? { ...c, qty: Math.min(c.qty + 1, p.stockQty) }
            : c,
        );
      }
      return [
        ...prev,
        {
          productId: p.id,
          name: p.name,
          price: p.price,
          unit: p.unit,
          quantityValue: p.quantityValue,
          stockQty: p.stockQty,
          qty: 1,
        },
      ];
    });
  }, []);

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.productId === productId
            ? { ...c, qty: Math.max(0, Math.min(c.qty + delta, c.stockQty)) }
            : c,
        )
        .filter((c) => c.qty > 0),
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((c) => c.productId !== productId));
  };

  const itemTotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const discountAmt = Math.max(0, parseFloat(discount) || 0);
  const calcDeliveryFee =
    type === "online"
      ? freeDeliveryThreshold > 0 && itemTotal >= freeDeliveryThreshold
        ? 0
        : deliveryFee
      : 0;
  const grandTotal = Math.max(0, itemTotal + calcDeliveryFee - discountAmt);

  const handleSubmit = () => {
    setError(null);
    if (cart.length === 0) {
      setError("Add at least one item to the bill");
      return;
    }
    if (type === "online" && phone.trim().length < 7) {
      setError("Enter a valid phone number for online orders");
      return;
    }
    if (type === "online" && !address.trim()) {
      setError("Delivery address is required for online orders");
      return;
    }
    startTransition(async () => {
      try {
        const { orderId } = await createBill({
          type,
          phone: phone.trim() || undefined,
          name: name.trim() || undefined,
          address: address.trim() || undefined,
          notes: notes.trim() || undefined,
          discount: discountAmt || undefined,
          items: cart.map((c) => ({ productId: c.productId, qty: c.qty })),
        });
        // Go straight to print preview
        router.push(`/admin/orders/${orderId}/print`);
      } catch (e: unknown) {
        setError(
          e instanceof Error ? e.message : "Failed to create bill. Try again.",
        );
      }
    });
  };

  const isOnline = type === "online";
  const totalItems = cart.reduce((s, c) => s + c.qty, 0);

  return (
    <div className="px-4 py-4 flex flex-col gap-4">
      {/* Type toggle */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1 flex gap-1">
        <button
          type="button"
          onClick={() => setType("walkin")}
          className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-colors ${
            !isOnline ? "bg-emerald-500 text-white shadow-sm" : "text-gray-500"
          }`}
        >
          🏪 Walk-in
        </button>
        <button
          type="button"
          onClick={() => setType("online")}
          className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-colors ${
            isOnline ? "bg-blue-500 text-white shadow-sm" : "text-gray-500"
          }`}
        >
          📱 Online
        </button>
      </div>

      {/* Customer info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
          Customer
        </p>
        <div className="flex gap-2">
          <input
            type="tel"
            inputMode="numeric"
            placeholder={isOnline ? "Phone *" : "Phone (optional)"}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-emerald-400"
          />
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-emerald-400"
          />
        </div>
        {isOnline && (
          <textarea
            placeholder="Delivery address *"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-emerald-400 resize-none"
          />
        )}
        <input
          type="text"
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-emerald-400"
        />
      </div>

      {/* Product picker */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
            Add products
          </p>
          {totalItems > 0 && (
            <span className="text-[11px] font-semibold text-emerald-600">
              {totalItems} item{totalItems !== 1 ? "s" : ""} added
            </span>
          )}
        </div>
        <div className="px-4 pb-3">
          <input
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:border-emerald-400"
            autoComplete="off"
          />
        </div>
        <div
          className={`max-h-72 overflow-y-auto divide-y divide-gray-50 transition-opacity ${
            deferredSearch !== search ? "opacity-60" : ""
          }`}
        >
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-[12px] text-gray-400">
              No products found
            </p>
          ) : (
            filtered.map((p) => (
              <ProductRow
                key={p.id}
                product={p}
                qtyInCart={cartMap.get(p.id) ?? 0}
                onAdd={addToCart}
              />
            ))
          )}
        </div>
      </div>

      {/* Cart */}
      {cart.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
              Bill items
            </p>
            <button
              type="button"
              onClick={() => setCart([])}
              className="text-[11px] font-semibold text-red-400 active:text-red-600"
            >
              Clear all
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {cart.map((c) => (
              <div key={c.productId} className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-800 truncate">
                    {c.name}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    ₹{c.price} × {c.qty} = ₹{c.price * c.qty}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateQty(c.productId, -1)}
                    className="w-7 h-7 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-[17px] active:bg-gray-200 leading-none"
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-[13px] font-bold text-gray-900">
                    {c.qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQty(c.productId, 1)}
                    disabled={c.qty >= c.stockQty}
                    className="w-7 h-7 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-[17px] active:bg-gray-200 leading-none disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeFromCart(c.productId)}
                  className="text-gray-300 font-bold text-[18px] w-5 text-center active:text-red-400 shrink-0 leading-none"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Totals */}
      {cart.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2.5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
            Bill summary
          </p>
          <div className="flex justify-between text-[13px]">
            <span className="text-gray-500">Items total</span>
            <span className="font-semibold text-gray-800">₹{itemTotal}</span>
          </div>
          {isOnline && (
            <div className="flex justify-between text-[13px]">
              <span className="text-gray-500">Delivery fee</span>
              <span className="font-semibold text-gray-800">
                {calcDeliveryFee === 0 && freeDeliveryThreshold > 0
                  ? "FREE"
                  : `₹${calcDeliveryFee}`}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13px] text-gray-500">Discount</span>
            <div className="flex items-center gap-1">
              <span className="text-[13px] text-gray-400">₹</span>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-20 text-right border border-gray-200 rounded-lg px-2 py-1 text-[13px] font-semibold outline-none focus:border-emerald-400"
              />
            </div>
          </div>
          <div className="border-t border-gray-100 pt-2.5 flex justify-between items-center">
            <span className="text-[14px] font-bold text-gray-900">Grand total</span>
            <span className={`text-[20px] font-bold ${isOnline ? "text-blue-700" : "text-emerald-700"}`}>
              ₹{grandTotal}
            </span>
          </div>
          {!isOnline && (
            <p className="text-[10px] text-gray-400">
              Walk-in bill is marked as Delivered immediately.
            </p>
          )}
          {isOnline && freeDeliveryThreshold > 0 && itemTotal < freeDeliveryThreshold && (
            <p className="text-[10px] text-emerald-600">
              Add ₹{freeDeliveryThreshold - itemTotal} more for free delivery.
            </p>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-[13px] font-semibold text-red-600">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isPending || cart.length === 0}
        className={`w-full rounded-2xl py-4 text-[15px] font-bold transition-colors ${
          cart.length === 0
            ? "bg-gray-100 text-gray-400 cursor-default"
            : isPending && isOnline
            ? "opacity-60 bg-blue-500 text-white"
            : isPending
            ? "opacity-60 bg-emerald-500 text-white"
            : isOnline
            ? "bg-blue-500 text-white active:bg-blue-600"
            : "bg-emerald-500 text-white active:bg-emerald-600"
        }`}
      >
        {isPending
          ? "Creating bill…"
          : `Create ${isOnline ? "Online" : "Walk-in"} Bill`}
      </button>
    </div>
  );
}
