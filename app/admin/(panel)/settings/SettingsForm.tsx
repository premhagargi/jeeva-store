"use client";

import { useState, useTransition } from "react";
import { Loader2, Check } from "lucide-react";
import { saveStoreSettings } from "./actions";

interface Settings {
  storeOpen: boolean;
  minOrderValue: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  storeHours: string | null;
  announcement: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
}

export default function SettingsForm({ initial }: { initial: Settings }) {
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      try {
        await saveStoreSettings(formData);
        setSavedAt(Date.now());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  const showSaved = savedAt && !pending && !error;

  return (
    <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-5">
      <label className="flex items-center justify-between gap-3 bg-emerald-50 rounded-xl px-3 py-2.5">
        <div>
          <p className="text-[13px] font-bold text-emerald-800">Store open</p>
          <p className="text-[11px] text-emerald-700/70">
            When off, customers see a "closed" banner and can't checkout.
          </p>
        </div>
        <input
          type="checkbox"
          name="storeOpen"
          defaultChecked={initial.storeOpen}
          className="w-5 h-5 accent-emerald-500"
        />
      </label>

      <Field label="Minimum order value (₹)" hint="Set to 0 to disable.">
        <input
          name="minOrderValue"
          type="number"
          min={0}
          step="1"
          defaultValue={initial.minOrderValue}
          className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-emerald-200"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Delivery fee (₹)" hint="Flat fee added at checkout.">
          <input
            name="deliveryFee"
            type="number"
            min={0}
            step="1"
            defaultValue={initial.deliveryFee}
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none"
          />
        </Field>
        <Field label="Free delivery above (₹)" hint="0 = always charge.">
          <input
            name="freeDeliveryThreshold"
            type="number"
            min={0}
            step="1"
            defaultValue={initial.freeDeliveryThreshold}
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none"
          />
        </Field>
      </div>

      <Field label="Store hours" hint="Shown on storefront.">
        <input
          name="storeHours"
          defaultValue={initial.storeHours ?? ""}
          placeholder="e.g. 8 AM – 9 PM, daily"
          className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none"
        />
      </Field>

      <Field label="Announcement banner" hint="Shown at the top of the storefront. Leave empty to hide.">
        <textarea
          name="announcement"
          defaultValue={initial.announcement ?? ""}
          rows={2}
          placeholder="e.g. Special offer: 10% off on rice this week!"
          className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-[13px] outline-none resize-none"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Contact phone">
          <input
            name="contactPhone"
            defaultValue={initial.contactPhone ?? ""}
            placeholder="+91 9876543210"
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none"
          />
        </Field>
        <Field label="Contact email">
          <input
            name="contactEmail"
            type="email"
            defaultValue={initial.contactEmail ?? ""}
            placeholder="hello@jeeva.com"
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none"
          />
        </Field>
      </div>

      {error && (
        <p className="bg-red-50 border border-red-100 text-red-600 text-[13px] rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-emerald-500 text-white font-bold text-[14px] py-2.5 rounded-xl active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Saving...
          </>
        ) : showSaved ? (
          <>
            <Check size={16} />
            Saved
          </>
        ) : (
          "Save settings"
        )}
      </button>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-semibold text-gray-700">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-gray-400">{hint}</span>}
    </label>
  );
}
