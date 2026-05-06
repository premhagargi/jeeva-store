"use client";

import { useEffect } from "react";
import { Printer } from "lucide-react";

export default function PrintTrigger({ autoPrint = false }: { autoPrint?: boolean }) {
  useEffect(() => {
    if (autoPrint) {
      const t = setTimeout(() => window.print(), 200);
      return () => clearTimeout(t);
    }
  }, [autoPrint]);

  return (
    <button
      onClick={() => window.print()}
      className="print:hidden flex items-center gap-2 bg-emerald-500 text-white font-bold text-[14px] px-4 py-2.5 rounded-xl active:scale-[0.98] transition-transform"
    >
      <Printer size={16} />
      Print receipt
    </button>
  );
}
