"use client";

import Link from "next/link";

export default function EmptyOrders() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="w-24 h-24 rounded-3xl bg-emerald-50 flex items-center justify-center text-5xl mb-5 shadow-inner">
        🛍️
      </div>
      <h3 className="text-[17px] font-bold text-gray-800 mb-2">
        No orders yet
      </h3>
      <p className="text-[13px] text-gray-400 leading-relaxed mb-6">
        Looks like you haven't placed any orders. Start shopping and get
        groceries in minutes!
      </p>
      <Link
        href="/"
        className="bg-emerald-500 text-white text-[14px] font-semibold px-8 py-3 rounded-xl shadow-md shadow-emerald-200 active:scale-95 transition-transform"
      >
        Shop Now
      </Link>
    </div>
  );
}