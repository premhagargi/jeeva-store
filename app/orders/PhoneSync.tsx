"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredPhone, setStoredPhone, clearStoredPhone } from "@/lib/customer";

export default function PhoneSync({ currentPhone }: { currentPhone: string | null }) {
  const router = useRouter();

  useEffect(() => {
    if (currentPhone) {
      setStoredPhone(currentPhone);
      return;
    }
    const stored = getStoredPhone();
    if (stored) {
      router.replace(`/orders?phone=${encodeURIComponent(stored)}`);
    }
  }, [currentPhone, router]);

  if (!currentPhone) return null;

  return (
    <button
      onClick={() => {
        clearStoredPhone();
        router.replace("/orders");
      }}
      className="text-[11px] font-semibold text-gray-400"
    >
      Switch number
    </button>
  );
}
