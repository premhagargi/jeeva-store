"use client";

import { useState, useTransition, useEffect } from "react";
import { X } from "lucide-react";
import { cancelOrder } from "./actions";
import { getStoredPhone } from "@/lib/customer";

export default function CancelButton({
  orderId,
  orderPhone,
}: {
  orderId: string;
  orderPhone: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [phoneMatch, setPhoneMatch] = useState(false);

  useEffect(() => {
    const stored = getStoredPhone();
    setPhoneMatch(stored === orderPhone);
  }, [orderPhone]);

  if (!phoneMatch) return null;

  function handleCancel() {
    if (!confirm("Cancel this order? Stock will be restored. This can't be undone.")) return;
    setError(null);
    startTransition(async () => {
      try {
        await cancelOrder(orderId, orderPhone);
      } catch (err: any) {
        setError(err?.message ?? "Failed to cancel order");
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        onClick={handleCancel}
        disabled={pending}
        className="flex items-center gap-1.5 text-[13px] font-semibold text-red-500 px-4 py-2 rounded-xl bg-red-50 active:scale-95 transition-transform disabled:opacity-60"
      >
        <X size={14} />
        {pending ? "Cancelling..." : "Cancel order"}
      </button>
      {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}
    </div>
  );
}
