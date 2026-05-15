"use client";

import { useState, useTransition } from "react";
import { saveCustomer } from "../actions";
import { Save, Flag, Loader2 } from "lucide-react";

interface Props {
  customer: {
    id: string;
    name: string | null;
    phone: string;
    address: string | null;
    notes: string | null;
    flagged: boolean;
  };
}

export default function CustomerEditor({ customer }: Props) {
  const [name, setName] = useState(customer.name ?? "");
  const [address, setAddress] = useState(customer.address ?? "");
  const [notes, setNotes] = useState(customer.notes ?? "");
  const [flagged, setFlagged] = useState(customer.flagged);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function save() {
    setSaved(false);
    setError(null);
    startTransition(async () => {
      try {
        await saveCustomer(customer.id, { name, address, notes, flagged });
        setSaved(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold text-emerald-600">{customer.phone}</p>
        <button
          onClick={() => setFlagged((v) => !v)}
          className={`text-[11px] font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg ${
            flagged ? "bg-red-500 text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          <Flag size={12} />
          {flagged ? "Flagged" : "Flag"}
        </button>
      </div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none"
      />
      <textarea
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Address"
        rows={2}
        className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-[13px] outline-none resize-none"
      />
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Internal notes (e.g. preferences, delivery instructions)"
        rows={3}
        className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-[13px] outline-none resize-none"
      />
      <button
        onClick={save}
        disabled={pending}
        className="bg-emerald-500 text-white font-bold text-[14px] py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {pending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        {pending ? "Saving..." : "Save changes"}
      </button>
      {saved && <p className="text-[11px] text-emerald-600 font-semibold">Saved ✓</p>}
      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
    </div>
  );
}
