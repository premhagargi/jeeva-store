"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, X } from "lucide-react";

interface Props {
  initialQuery: string;
  lowStock: boolean;
  total: number;
}

export default function SearchBar({ initialQuery, lowStock, total }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const firstRender = useRef(true);
  const lastPushed = useRef(initialQuery);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const v = value.trim();
    if (v === lastPushed.current) return;
    const t = setTimeout(() => {
      lastPushed.current = v;
      const params = new URLSearchParams();
      if (v) params.set("q", v);
      if (lowStock) params.set("lowStock", "1");
      const qs = params.toString();
      startTransition(() => {
        router.replace(`/admin/products${qs ? `?${qs}` : ""}`, { scroll: false });
      });
    }, 250);
    return () => clearTimeout(t);
  }, [value, lowStock, router]);

  function clear() {
    setValue("");
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-2.5 shadow-sm">
        <Search size={16} className="text-gray-400" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search products or categories..."
          className="flex-1 bg-transparent text-[14px] text-gray-800 outline-none"
          autoComplete="off"
          enterKeyHint="search"
        />
        {isPending ? (
          <Loader2 size={14} className="text-gray-400 animate-spin" />
        ) : value ? (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className="text-gray-400 active:text-gray-700"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <a
          href={lowStock ? "/admin/products" : "/admin/products?lowStock=1"}
          className={`text-[12px] font-semibold px-3 py-1.5 rounded-full ${
            lowStock ? "bg-red-500 text-white" : "bg-white border border-gray-200 text-gray-600"
          }`}
        >
          {lowStock ? "Low stock ✕" : "Low stock only"}
        </a>
        <span className="text-[12px] text-gray-400">
          {total} result{total === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  );
}
