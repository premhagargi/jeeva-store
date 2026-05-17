"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import Link from "next/link";
import { Plus, X, Check, Pencil, Loader2, Package } from "lucide-react";
import { createProductInCategory } from "../actions";
import { updateInventory } from "../../products/actions";

type AdminCategoryProduct = {
  id: string;
  name: string;
  unit: string;
  quantityValue: number | null;
  price: number;
  stockQty: number;
  isAvailable: boolean;
  imageUrl: string | null;
};

interface Props {
  categoryId: string;
  categoryName: string;
  initialProducts: AdminCategoryProduct[];
}

const UNIT_PRESETS = ["g", "kg", "ml", "L", "pcs", "pack"];

export default function CategoryProductsView({
  categoryId,
  categoryName,
  initialProducts,
}: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    if (!justAddedId) return;
    const t = setTimeout(() => setJustAddedId(null), 2500);
    return () => clearTimeout(t);
  }, [justAddedId]);

  function handleCreated(p: AdminCategoryProduct) {
    setProducts((prev) => [p, ...prev.filter((x) => x.id !== p.id)]);
    setJustAddedId(p.id);
    setSheetOpen(false);
  }

  return (
    <>
      {products.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
            <Package size={24} className="text-gray-400" />
          </div>
          <p className="text-[14px] font-semibold text-gray-700">
            No products in {categoryName} yet
          </p>
          <p className="text-[12px] text-gray-400 mt-1 mb-5">
            Tap the button below to add your first one.
          </p>
        </div>
      ) : (
        <div className="px-4 py-4 flex flex-col gap-2">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              highlight={p.id === justAddedId}
              onChange={(next) =>
                setProducts((prev) => prev.map((x) => (x.id === next.id ? next : x)))
              }
            />
          ))}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-4 pt-3 bg-gradient-to-t from-gray-50 via-gray-50/95 to-transparent pointer-events-none">
        <button
          onClick={() => setSheetOpen(true)}
          className="pointer-events-auto w-full bg-emerald-500 text-white font-bold text-[14px] rounded-2xl py-3.5 flex items-center justify-center gap-2 shadow-xl shadow-emerald-300/40 active:scale-[0.98] transition-transform"
        >
          <Plus size={18} />
          Add product to {categoryName}
        </button>
      </div>

      {sheetOpen && (
        <AddProductSheet
          categoryId={categoryId}
          categoryName={categoryName}
          onClose={() => setSheetOpen(false)}
          onCreated={handleCreated}
        />
      )}
    </>
  );
}

function ProductCard({
  product,
  highlight,
  onChange,
}: {
  product: AdminCategoryProduct;
  highlight: boolean;
  onChange: (next: AdminCategoryProduct) => void;
}) {
  const [price, setPrice] = useState(String(product.price));
  const [stock, setStock] = useState(String(product.stockQty));
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    setPrice(String(product.price));
    setStock(String(product.stockQty));
  }, [product.price, product.stockQty]);

  const dirty =
    price !== String(product.price) || stock !== String(product.stockQty);

  function toggle() {
    const next = !product.isAvailable;
    onChange({ ...product, isAvailable: next });
    startTransition(async () => {
      await updateInventory(product.id, { isAvailable: next });
      setSavedAt(Date.now());
    });
  }

  function save() {
    const p = Number(price);
    const s = Number(stock);
    startTransition(async () => {
      await updateInventory(product.id, { price: p, stockQty: s });
      onChange({ ...product, price: p, stockQty: s });
      setSavedAt(Date.now());
    });
  }

  const qtyLabel =
    product.quantityValue != null
      ? `${product.quantityValue} ${product.unit}`
      : product.unit;

  return (
    <div
      className={`bg-white rounded-2xl border shadow-sm p-3 flex flex-col gap-3 transition-colors ${
        highlight ? "border-emerald-300 ring-2 ring-emerald-100" : "border-gray-100"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package size={18} className="text-gray-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-gray-900 truncate">
            {product.name}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">{qtyLabel}</p>
        </div>
        <button
          onClick={toggle}
          disabled={pending}
          aria-label={product.isAvailable ? "Disable" : "Enable"}
          className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${
            product.isAvailable ? "bg-emerald-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              product.isAvailable ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Price ₹
          </span>
          <input
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5 text-[13px] outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
            Stock
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
            className={`bg-gray-50 border rounded-lg px-2.5 py-1.5 text-[13px] outline-none focus:ring-2 focus:ring-emerald-200 ${
              Number(stock) < 10 ? "border-red-200" : "border-gray-100"
            }`}
          />
        </label>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[11px] text-gray-400">
          {pending ? (
            <span className="flex items-center gap-1 text-gray-500">
              <Loader2 size={11} className="animate-spin" /> Saving...
            </span>
          ) : savedAt && !dirty ? (
            <span className="flex items-center gap-1 text-emerald-600">
              <Check size={11} /> Saved
            </span>
          ) : (
            ""
          )}
        </span>
        <div className="flex gap-1.5">
          <Link
            href={`/admin/products/${product.id}/edit`}
            className="flex items-center gap-1 text-[11px] font-bold text-gray-700 bg-gray-50 px-2.5 py-1.5 rounded-lg active:scale-95 transition-transform"
          >
            <Pencil size={11} /> Details
          </Link>
          <button
            onClick={save}
            disabled={!dirty || pending}
            className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-emerald-500 text-white disabled:bg-gray-200 disabled:text-gray-400 active:scale-95 transition-transform"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function AddProductSheet({
  categoryId,
  categoryName,
  onClose,
  onCreated,
}: {
  categoryId: string;
  categoryName: string;
  onClose: () => void;
  onCreated: (p: AdminCategoryProduct) => void;
}) {
  const [name, setName] = useState("");
  const [quantityValue, setQuantityValue] = useState("");
  const [unit, setUnit] = useState("pcs");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const n = name.trim();
    const qv = quantityValue.trim() === "" ? null : Number(quantityValue);
    const p = Number(price);
    const s = Number(stock);

    if (!n) return setError("Enter product name");
    if (qv != null && (!Number.isFinite(qv) || qv <= 0))
      return setError("Quantity must be a positive number");
    if (!unit.trim()) return setError("Pick a unit");
    if (!Number.isFinite(p) || p < 0) return setError("Enter a valid price");
    if (!Number.isInteger(s) || s < 0) return setError("Stock must be a whole number ≥ 0");

    startTransition(async () => {
      try {
        const created = await createProductInCategory(categoryId, {
          name: n,
          quantityValue: qv,
          unit: unit.trim(),
          price: p,
          stockQty: s,
        });
        onCreated({ ...created, imageUrl: null });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add product");
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/40 animate-in fade-in duration-150"
        onClick={() => !pending && onClose()}
      />
      <div className="relative w-full max-w-md bg-white rounded-t-3xl shadow-2xl pb-6 animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div>
            <p className="text-[16px] font-bold text-gray-900">Add product</p>
            <p className="text-[11px] text-gray-400">in {categoryName}</p>
          </div>
          <button
            onClick={onClose}
            disabled={pending}
            aria-label="Close"
            className="w-9 h-9 rounded-xl flex items-center justify-center active:bg-gray-100 disabled:opacity-50"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={submit} className="px-5 pt-2 flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Product name
            </span>
            <input
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Basmati Rice"
              className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </label>

          <div className="grid grid-cols-[1fr_1.4fr] gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Quantity
              </span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={quantityValue}
                onChange={(e) => setQuantityValue(e.target.value)}
                placeholder="1"
                className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </label>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Unit
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {UNIT_PRESETS.map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnit(u)}
                    className={`text-[12px] font-bold px-2.5 py-1.5 rounded-lg border transition-colors ${
                      unit === u
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "bg-gray-50 border-gray-100 text-gray-600"
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Price ₹
              </span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Stock qty
              </span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-[12px] rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <p className="text-[11px] text-gray-400">
            Tip: image can be added later from the product details page.
          </p>

          <button
            type="submit"
            disabled={pending}
            className="mt-1 bg-emerald-500 text-white font-bold text-[14px] py-3 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98] transition-transform"
          >
            {pending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus size={16} />
                Add product
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
