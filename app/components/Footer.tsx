"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/product/")) return null;
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-white border-t border-gray-100 px-6 py-10 mt-2">
      <div className="max-w-md mx-auto text-center flex flex-col items-center gap-3">
        <div className="text-3xl">🛒</div>
        <p className="text-[14px] font-bold text-gray-800">
          Fresh groceries, delivered fast.
        </p>
        <p className="text-[12px] text-gray-500 leading-relaxed">
          Shop daily essentials with ease at Jeeva Mart — your one-stop store
          for groceries, household items, and more.
        </p>
        <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-400">
          <span className="flex items-center gap-1">⚡ 8-min delivery</span>
          <span className="flex items-center gap-1">✅ Best prices</span>
        </div>
        <p className="text-[10px] text-gray-300 mt-4">
          © {new Date().getFullYear()} Jeeva Mart. Made with ♥ in Belagavi.
        </p>
      </div>
    </footer>
  );
}
