"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import { createProduct, updateProduct } from "./actions";
import type { ProductInput } from "./types";

interface Props {
  mode: "create" | "edit";
  productId?: string;
  initial: ProductInput;
  categories: Array<{ name: string }>;
}

export default function ProductForm({ mode, productId, initial, categories }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [categoryName, setCategoryName] = useState(initial.categoryName);
  const [unit, setUnit] = useState(initial.unit);
  const [quantityValue, setQuantityValue] = useState(
    initial.quantityValue != null ? String(initial.quantityValue) : "",
  );
  const [price, setPrice] = useState(String(initial.price));
  const [stockQty, setStockQty] = useState(String(initial.stockQty));
  const [isAvailable, setIsAvailable] = useState(initial.isAvailable);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const qv = quantityValue.trim() === "" ? null : Number(quantityValue);

    const input: ProductInput = {
      name,
      categoryName,
      unit,
      quantityValue: qv,
      price: Number(price),
      stockQty: Number(stockQty),
      isAvailable,
    };

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createProduct(input);
        } else if (productId) {
          await updateProduct(productId, input);
        }
      } catch (err: any) {
        if (err?.digest?.startsWith?.("NEXT_REDIRECT")) throw err;
        setError(err?.message ?? "Save failed");
      }
    });
  }

  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-2 mb-4">
        <Link
          href="/admin/products"
          className="w-9 h-9 rounded-xl flex items-center justify-center active:bg-gray-100"
        >
          <ChevronLeft size={20} className="text-gray-700" />
        </Link>
        <h1 className="text-[18px] font-bold text-gray-900">
          {mode === "create" ? "New product" : "Edit product"}
        </h1>
      </div>

      <form onSubmit={submit} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
        <Field label="Name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </Field>

        <Field label="Category" hint="Type a new name to create a new category">
          <input
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            list="admin-categories"
            required
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <datalist id="admin-categories">
            {categories.map((c) => (
              <option key={c.name} value={c.name} />
            ))}
          </datalist>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Quantity">
            <input
              type="number"
              min={0}
              step="any"
              value={quantityValue}
              onChange={(e) => setQuantityValue(e.target.value)}
              placeholder="e.g. 500"
              className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </Field>
          <Field label="Unit">
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="g, kg, ml, l, pc..."
              required
              className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Price (₹)">
            <input
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </Field>
          <Field label="Stock qty">
            <input
              type="number"
              min={0}
              step={1}
              value={stockQty}
              onChange={(e) => setStockQty(e.target.value)}
              required
              className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </Field>
        </div>

        <label className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
          <span className="text-[13px] font-semibold text-gray-700">Available for purchase</span>
          <button
            type="button"
            onClick={() => setIsAvailable((v) => !v)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              isAvailable ? "bg-emerald-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                isAvailable ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </label>

        {error && (
          <p className="bg-red-50 border border-red-100 text-red-600 text-[13px] rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="flex-1 bg-gray-100 text-gray-700 font-semibold text-[14px] py-2.5 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="flex-1 bg-emerald-500 text-white font-bold text-[14px] py-2.5 rounded-xl active:scale-[0.98] transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {pending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving...
              </>
            ) : mode === "create" ? (
              "Create product"
            ) : (
              "Save changes"
            )}
          </button>
        </div>

        {mode === "create" && (
          <p className="text-[11px] text-gray-400 text-center">
            You can upload an image after creating the product.
          </p>
        )}
      </form>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-semibold text-gray-700">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-gray-400">{hint}</span>}
    </label>
  );
}
