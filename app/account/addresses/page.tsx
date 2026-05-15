"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, MapPin, Plus, Trash2, Star, Edit2, X } from "lucide-react";
import { getStoredPhone } from "@/lib/customer";

type Address = {
  id: string;
  phone: string;
  label: string | null;
  fullName: string | null;
  line1: string;
  line2: string | null;
  landmark: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  isDefault: boolean;
};

const EMPTY: Omit<Address, "id" | "phone" | "isDefault"> = {
  label: "",
  fullName: "",
  line1: "",
  line2: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
};

export default function AddressesPage() {
  const [phone, setPhone] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Address | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async (p: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/addresses?phone=${encodeURIComponent(p)}`);
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = getStoredPhone();
    if (stored) {
      setPhone(stored);
      load(stored);
    } else {
      setLoading(false);
    }
  }, [load]);

  async function makeDefault(id: string) {
    await fetch("/api/addresses", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isDefault: true }),
    });
    if (phone) load(phone);
  }

  async function remove(id: string) {
    await fetch(`/api/addresses?id=${id}`, { method: "DELETE" });
    if (phone) load(phone);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-2">
        <Link
          href="/account"
          className="w-9 h-9 rounded-xl flex items-center justify-center active:bg-gray-100"
        >
          <ChevronLeft size={20} className="text-gray-700" />
        </Link>
        <h1 className="text-[16px] font-bold text-gray-900">Saved Addresses</h1>
      </div>

      {!phone ? (
        <div className="px-8 py-16 text-center">
          <p className="text-[14px] text-gray-500 mb-4">Add your phone number to save addresses.</p>
          <Link href="/account" className="text-[13px] font-semibold text-emerald-600">Go to Account</Link>
        </div>
      ) : loading ? (
        <div className="px-4 py-4 flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 bg-white border border-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="px-4 py-4 flex flex-col gap-3">
          {addresses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 px-6 py-10 text-center">
              <MapPin className="mx-auto text-gray-300 mb-2" size={32} />
              <p className="text-[14px] text-gray-500">No saved addresses yet.</p>
            </div>
          ) : (
            addresses.map((a) => (
              <div key={a.id} className="bg-white border border-gray-100 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-gray-900">
                      {a.label || "Address"}
                    </span>
                    {a.isDefault && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {!a.isDefault && (
                      <button
                        onClick={() => makeDefault(a.id)}
                        className="w-7 h-7 rounded-lg bg-gray-50 active:bg-gray-100 flex items-center justify-center"
                        title="Set default"
                      >
                        <Star size={14} className="text-gray-500" />
                      </button>
                    )}
                    <button
                      onClick={() => setEditing(a)}
                      className="w-7 h-7 rounded-lg bg-gray-50 active:bg-gray-100 flex items-center justify-center"
                    >
                      <Edit2 size={14} className="text-gray-500" />
                    </button>
                    <button
                      onClick={() => remove(a.id)}
                      className="w-7 h-7 rounded-lg bg-red-50 active:bg-red-100 flex items-center justify-center"
                    >
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </div>
                </div>
                {a.fullName && <p className="text-[13px] font-medium text-gray-800">{a.fullName}</p>}
                <p className="text-[13px] text-gray-700">{a.line1}</p>
                {a.line2 && <p className="text-[13px] text-gray-700">{a.line2}</p>}
                {(a.city || a.state || a.pincode) && (
                  <p className="text-[12px] text-gray-500">
                    {[a.city, a.state, a.pincode].filter(Boolean).join(", ")}
                  </p>
                )}
                {a.landmark && <p className="text-[12px] text-gray-400">Landmark: {a.landmark}</p>}
              </div>
            ))
          )}

          <button
            onClick={() => setCreating(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 text-emerald-600 text-[14px] font-semibold active:scale-[0.98]"
          >
            <Plus size={16} /> Add new address
          </button>
        </div>
      )}

      {(creating || editing) && phone && (
        <AddressForm
          phone={phone}
          initial={editing ?? { ...EMPTY, id: "", phone, isDefault: false } as Address}
          isNew={creating}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); load(phone); }}
        />
      )}
    </div>
  );
}

function AddressForm({
  phone, initial, isNew, onClose, onSaved,
}: {
  phone: string;
  initial: Address;
  isNew: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    label: initial.label ?? "",
    fullName: initial.fullName ?? "",
    line1: initial.line1 ?? "",
    line2: initial.line2 ?? "",
    landmark: initial.landmark ?? "",
    city: initial.city ?? "",
    state: initial.state ?? "",
    pincode: initial.pincode ?? "",
    isDefault: initial.isDefault,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function update<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    if (!form.line1.trim()) {
      setErr("Address line 1 is required");
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        await fetch("/api/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, ...form }),
        });
      } else {
        await fetch("/api/addresses", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: initial.id, ...form }),
        });
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-bold text-gray-900">
            {isNew ? "Add address" : "Edit address"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        <div className="flex flex-col gap-2.5">
          <input
            value={form.label}
            onChange={(e) => update("label", e.target.value)}
            placeholder="Label (Home, Work...)"
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <input
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            placeholder="Full name"
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <input
            value={form.line1}
            onChange={(e) => update("line1", e.target.value)}
            placeholder="House/flat, street *"
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <input
            value={form.line2}
            onChange={(e) => update("line2", e.target.value)}
            placeholder="Area, locality"
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <input
            value={form.landmark}
            onChange={(e) => update("landmark", e.target.value)}
            placeholder="Landmark (optional)"
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              placeholder="City"
              className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-emerald-200"
            />
            <input
              value={form.pincode}
              onChange={(e) => update("pincode", e.target.value)}
              placeholder="Pincode"
              className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
          <input
            value={form.state}
            onChange={(e) => update("state", e.target.value)}
            placeholder="State"
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <label className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => update("isDefault", e.target.checked)}
              className="w-4 h-4 accent-emerald-500"
            />
            <span className="text-[13px] text-gray-700">Set as default address</span>
          </label>
          {err && <p className="text-[12px] text-red-500">{err}</p>}
          <button
            onClick={save}
            disabled={saving}
            className="mt-2 bg-emerald-500 text-white rounded-xl py-3 font-semibold text-[14px] active:scale-[0.98] disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save address"}
          </button>
        </div>
      </div>
    </div>
  );
}
