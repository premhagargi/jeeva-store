"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { updateInventory, deleteProduct } from "./actions";
import ImageUpload from "./ImageUpload";
import { styleFor } from "@/lib/category-style";

export interface AdminProduct {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantityValue: number | null;
  price: number;
  stockQty: number;
  isAvailable: boolean;
  imageUrl: string | null;
}

export default function ProductRow({ product }: { product: AdminProduct }) {
  const [price, setPrice] = useState(String(product.price));
  const [stock, setStock] = useState(String(product.stockQty));
  const [available, setAvailable] = useState(product.isAvailable);
  const [pending, startTransition] = useTransition();
  const [deleting, startDelete] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const dirty =
    price !== String(product.price) ||
    stock !== String(product.stockQty) ||
    available !== product.isAvailable;

  function save() {
    startTransition(async () => {
      await updateInventory(product.id, {
        price: Number(price),
        stockQty: Number(stock),
        isAvailable: available,
      });
      setSavedAt(Date.now());
    });
  }

  function toggle() {
    const next = !available;
    setAvailable(next);
    startTransition(async () => {
      await updateInventory(product.id, { isAvailable: next });
      setSavedAt(Date.now());
    });
  }

  const qtyLabel =
    product.quantityValue != null ? `${product.quantityValue} ${product.unit}` : product.unit;
  const fallback = styleFor(product.category);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-gray-900 truncate">{product.name}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {product.category} · {qtyLabel}
          </p>
        </div>
        <button
          onClick={toggle}
          disabled={pending}
          className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
            available ? "bg-emerald-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              available ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <ImageUpload
        productId={product.id}
        productName={product.name}
        imageUrl={product.imageUrl}
        fallbackEmoji={fallback.emoji}
        fallbackBg={fallback.bg}
      />

      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-gray-400">Price (₹)</span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-2 text-[13px] outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-gray-400 flex items-center gap-1">
            Stock qty
            {Number(stock) < 10 && Number(stock) >= 0 && (
              <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1 rounded">
                LOW
              </span>
            )}
          </span>
          <input
            type="number"
            min={0}
            step={1}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className={`bg-gray-50 border rounded-lg px-2.5 py-2 text-[13px] outline-none focus:ring-2 focus:ring-emerald-200 ${
              Number(stock) < 10 ? "border-red-200" : "border-gray-100"
            }`}
          />
        </label>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[11px] text-gray-400">
          {savedAt && !dirty && !pending ? "Saved ✓" : ""}
        </span>
        <button
          onClick={save}
          disabled={!dirty || pending}
          className="text-[12px] font-bold px-3 py-1.5 rounded-lg bg-emerald-500 text-white disabled:bg-gray-200 disabled:text-gray-400 active:scale-95 transition-transform"
        >
          {pending ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
        <Link
          href={`/admin/products/${product.id}/edit`}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-700 px-3 py-1.5 rounded-lg bg-gray-50 active:scale-95 transition-transform"
        >
          <Pencil size={12} />
          Edit details
        </Link>
        <button
          onClick={() => {
            if (!confirm(`Delete "${product.name}"? This can't be undone.`)) return;
            setDeleteError(null);
            startDelete(async () => {
              try {
                await deleteProduct(product.id);
              } catch (err: any) {
                setDeleteError(err?.message ?? "Delete failed");
              }
            });
          }}
          disabled={deleting}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-red-600 px-3 py-1.5 rounded-lg bg-red-50 active:scale-95 transition-transform disabled:opacity-60"
        >
          <Trash2 size={12} />
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
      {deleteError && (
        <p className="text-[11px] text-red-600 font-medium">{deleteError}</p>
      )}
    </div>
  );
}
