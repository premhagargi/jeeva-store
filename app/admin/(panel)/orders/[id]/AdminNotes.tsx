"use client";

import { useState, useTransition } from "react";
import { saveOrderAdminNotes } from "../actions";
import { Save } from "lucide-react";

export default function AdminNotes({ orderId, initial }: { orderId: string; initial: string }) {
  const [notes, setNotes] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-3 flex flex-col gap-2">
      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
        Admin notes (internal)
      </p>
      <textarea
        value={notes}
        onChange={(e) => {
          setNotes(e.target.value);
          setSaved(false);
        }}
        rows={3}
        placeholder="Notes only admins can see…"
        className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-[13px] outline-none resize-none"
      />
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await saveOrderAdminNotes(orderId, notes);
            setSaved(true);
          })
        }
        className="self-end text-[11px] font-bold flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 disabled:opacity-50"
      >
        <Save size={12} />
        {saved ? "Saved ✓" : "Save"}
      </button>
    </div>
  );
}
