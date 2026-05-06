"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, User, MapPin, ChevronDown, X } from "lucide-react";

interface NavbarProps {
  shopName?: string;
  location?: string;
}

export default function Navbar({
  shopName = "QuickMart",
  location = "Bhagya Nagar, 3rd Cross",
}: NavbarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

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
            onClick={() => router.push('/account')}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <User size={16} className="text-white" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const q = searchQuery.trim();
          if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
        }}
        className={`flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5 transition-all duration-200 ${
          searchFocused
            ? "bg-white ring-2 ring-emerald-400 shadow-md"
            : "hover:bg-gray-200"
        }`}
      >
        <Search
          size={16}
          className={`shrink-0 transition-colors ${
            searchFocused ? "text-emerald-500" : "text-gray-400"
          }`}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder='Search for "rice", "soap"...'
          className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </form>
    </nav>
  );
}