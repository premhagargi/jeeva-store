"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateBillBar() {
  const router = useRouter();

  useEffect(() => {
    // Warm the router cache so the first tap opens instantly
    router.prefetch("/admin/bill/new");
  }, [router]);

  return (
    <div className="fixed bottom-4 left-4 right-4 z-20 print:hidden">
      <div className="bg-gray-900 rounded-2xl flex shadow-xl shadow-black/25 overflow-hidden">
        <Link
          href="/admin/bill/new?type=walkin"
          className="flex-1 flex items-center justify-center gap-2 py-4 text-[14px] font-bold text-white active:bg-gray-800 transition-colors"
        >
          🏪 Walk-in Bill
        </Link>
        <div className="w-px bg-white/10 self-stretch" />
        <Link
          href="/admin/bill/new?type=online"
          className="flex-1 flex items-center justify-center gap-2 py-4 text-[14px] font-bold text-white active:bg-gray-800 transition-colors"
        >
          📱 Online Bill
        </Link>
      </div>
    </div>
  );
}
