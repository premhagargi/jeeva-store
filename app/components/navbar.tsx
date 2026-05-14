"use client";

import { useRouter, usePathname } from "next/navigation";
import { User, MapPin, ChevronDown } from "lucide-react";
import SearchRecommendations from "./SearchRecommendations";

interface NavbarProps {
  shopName?: string;
  location?: string;
}

export default function Navbar({
  shopName = "QuickMart",
  location = "Bhagya Nagar, 3rd Cross",
}: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const showSearchBar = pathname !== "/search";
  const hideNavbar = pathname?.startsWith("/product/");

  if (hideNavbar) return null;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white shadow-sm px-4 pt-4 pb-3 flex flex-col gap-3">
      {/* Top Row: Shop name + Account */}
      <div className="flex items-center justify-between">
        {/* Left: Shop name + location */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-500">
              ⚡ 5 minutes
            </span>
          </div>
          <button className="flex items-center gap-1 mt-0.5 group">
            <span className="text-sm font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
              {shopName}
            </span>
            <ChevronDown
              size={14}
              className="text-gray-500 group-hover:text-emerald-600 transition-colors mt-0.5"
            />
          </button>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={11} className="text-gray-400 shrink-0" />
            <span className="text-[11px] text-gray-400 truncate max-w-[180px]">
              {location}
            </span>
          </div>
        </div>

        {/* Right: Wallet + Account */}
        <div className="flex items-center gap-2">
          {/* Wallet chip */}
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1.5">
            <span className="text-[10px]">🪙</span>
            <span className="text-xs font-semibold text-emerald-700">₹0</span>
          </div>

          {/* Account avatar */}
          <button
            onClick={() => router.push("/account")}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <User size={16} className="text-white" />
          </button>
        </div>
      </div>

      {/* Search Bar with Recommendations */}
      {showSearchBar && <SearchRecommendations />}
    </nav>
  );
}