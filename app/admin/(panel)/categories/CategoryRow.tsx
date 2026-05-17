"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Trash2, Save, Edit3, ChevronRight, Package } from "lucide-react";
import { updateCategory, deleteCategory } from "./actions";
import { CATEGORY_BG_PALETTE, styleForCategory } from "@/lib/category-style";

interface Props {
  category: {
    id: string;
    name: string;
    emoji: string | null;
    bgColor: string | null;
    sortOrder: number;
    productCount: number;
  };
}

export default function CategoryRow({ category }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [emoji, setEmoji] = useState(category.emoji ?? "");
  const [bgColor, setBgColor] = useState(category.bgColor ?? "");
  const [sortOrder, setSortOrder] = useState(String(category.sortOrder));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const style = styleForCategory({ name, emoji, bgColor });

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        await updateCategory(category.id, {
          name,
          emoji,
          bgColor,
          sortOrder: Number(sortOrder) || 0,
        });
        setEditing(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  function remove() {
    if (!confirm(`Delete "${category.name}"?`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteCategory(category.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed");
      }
    });
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-3 flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${style.bg}`}
        >
          {style.emoji}
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 text-[14px] font-bold outline-none"
            />
          ) : (
            <p className="text-[14px] font-bold text-gray-900 truncate">{category.name}</p>
          )}
          <p className="text-[11px] text-gray-400">
            {category.productCount} product{category.productCount === 1 ? "" : "s"} · sort {category.sortOrder}
          </p>
        </div>
        <div className="flex gap-1.5">
          {editing ? (
            <button
              onClick={save}
              disabled={pending}
              className="text-[11px] font-bold flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 disabled:opacity-50"
            >
              <Save size={12} />
              Save
            </button>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="text-[11px] font-bold flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700"
            >
              <Edit3 size={12} />
              Edit
            </button>
          )}
          <button
            onClick={remove}
            disabled={pending || category.productCount > 0}
            title={category.productCount > 0 ? "Has products" : "Delete"}
            className="text-[11px] font-bold flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 disabled:opacity-40"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {editing && (
        <div className="grid grid-cols-3 gap-2 pt-1">
          <input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            placeholder="Emoji"
            maxLength={4}
            className="bg-gray-50 border border-gray-100 rounded-lg px-2 py-1.5 text-[13px] outline-none"
          />
          <select
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="bg-gray-50 border border-gray-100 rounded-lg px-2 py-1.5 text-[13px] outline-none"
          >
            <option value="">Auto bg</option>
            {CATEGORY_BG_PALETTE.map((c) => (
              <option key={c} value={c}>
                {c.replace("bg-", "").replace("-100", "")}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            placeholder="Sort"
            className="bg-gray-50 border border-gray-100 rounded-lg px-2 py-1.5 text-[13px] outline-none"
          />
        </div>
      )}
      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}

      {!editing && (
        <Link
          href={`/admin/categories/${category.id}`}
          className="flex items-center justify-between gap-2 mt-1 border-t border-gray-100 pt-3 -mb-1 active:bg-gray-50 -mx-3 px-3 rounded-b-2xl"
        >
          <span className="flex items-center gap-2 text-[12px] font-semibold text-emerald-700">
            <Package size={13} />
            Manage products ({category.productCount})
          </span>
          <ChevronRight size={14} className="text-gray-400" />
        </Link>
      )}
    </div>
  );
}
