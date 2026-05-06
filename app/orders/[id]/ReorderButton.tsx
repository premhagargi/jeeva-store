"use client";

import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { addLines, type CartLine } from "@/lib/cart";

export default function ReorderButton({ lines }: { lines: CartLine[] }) {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        addLines(lines);
        router.push("/cart");
      }}
      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-500 text-white font-bold text-[14px] shadow-md shadow-emerald-200 active:scale-[0.98] transition-transform"
    >
      <RotateCcw size={16} />
      Reorder all items
    </button>
  );
}
