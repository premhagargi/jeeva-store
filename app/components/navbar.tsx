"use client";

import { useRouter, usePathname } from "next/navigation";
import { User, Zap, Search } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const showSearchBar = pathname !== "/search";
  const hideNavbar =
    pathname?.startsWith("/product/") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/category/") ||
    pathname?.startsWith("/search") ||
    pathname?.startsWith("/cart") ||
    pathname?.startsWith("/checkout") ||
    /^\/orders\/[^/]+/.test(pathname ?? "") ||
    pathname?.startsWith("/account/addresses");

  if (hideNavbar) return null;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white shadow-sm px-4 pt-3 pb-3 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">
              <Zap size={10} className="text-emerald-600 fill-emerald-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Delivery in 10 min
              </span>
            </span>
          </div>
          <span className="mt-1 text-[18px] font-extrabold text-gray-900 leading-tight">
            Jeeva Mart
          </span>
          <span className="text-[11px] text-gray-400">
            Daily essentials, delivered fast
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1.5">
            <span className="text-[10px]">🪙</span>
            <span className="text-xs font-semibold text-emerald-700">₹0</span>
          </div>

          <button
            onClick={() => router.push("/account")}
            aria-label="Account"
            className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <User size={16} className="text-white" />
          </button>
        </div>
      </div>

      {showSearchBar && (
        <Link
          href="/search"
          aria-label="Search products"
          className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5 active:bg-gray-200 transition-colors"
        >
          <Search size={16} className="shrink-0 text-gray-400" />
          <span className="flex-1 text-sm text-gray-400 truncate">
            Search for &quot;rice&quot;, &quot;soap&quot;...
          </span>
        </Link>
      )}
    </nav>
  );
}
