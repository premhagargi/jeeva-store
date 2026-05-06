"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredPhone } from "@/lib/customer";

export default function PhonePrompt() {
  const router = useRouter();
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const stored = getStoredPhone();
    if (stored) router.replace(`/orders?phone=${encodeURIComponent(stored)}`);
  }, [router]);

  return (
    <div className="px-6 py-12 flex flex-col items-center text-center">
      <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center text-4xl mb-4">
        📦
      </div>
      <h2 className="text-[16px] font-bold text-gray-800 mb-2">View your orders</h2>
      <p className="text-[13px] text-gray-400 mb-6">
        Enter the phone number you used at checkout.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const p = phone.trim();
          if (p) router.push(`/orders?phone=${encodeURIComponent(p)}`);
        }}
        className="w-full max-w-xs flex flex-col gap-3"
      >
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number"
          className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-[14px] text-gray-800 outline-none focus:ring-2 focus:ring-emerald-200"
          required
        />
        <button
          type="submit"
          className="bg-emerald-500 text-white font-semibold text-[14px] py-2.5 rounded-xl active:scale-95 transition-transform"
        >
          Show orders
        </button>
      </form>
    </div>
  );
}
