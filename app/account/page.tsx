"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MapPin, ShoppingBag, Heart, Tag, HelpCircle,
  FileText, LogOut, ChevronRight, Bell, Shield, Phone, X, Check,
} from "lucide-react";
import Link from "next/link";
import { getStoredPhone, clearStoredPhone, setStoredPhone } from "@/lib/customer";

type CustomerData = {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  address: string | null;
  orderCount: number;
};

const menuSections = [
  {
    title: "My Activity",
    items: [
      { icon: ShoppingBag, label: "My Orders",        href: "/orders",  color: "bg-emerald-50 text-emerald-600" },
      { icon: MapPin,      label: "Saved Addresses",  href: "/account/addresses", color: "bg-blue-50 text-blue-600" },
      { icon: Heart,       label: "Wishlist",          href: "/wishlist", color: "bg-rose-50 text-rose-500"     },
    ],
  },
  {
    title: "Offers & Savings",
    items: [
      { icon: Tag,  label: "Coupons & Offers", href: "/coupons", color: "bg-amber-50 text-amber-600" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: HelpCircle, label: "Help & Support",     href: "/help",    color: "bg-purple-50 text-purple-600" },
      { icon: FileText,   label: "Terms & Privacy",    href: "/terms",   color: "bg-gray-100 text-gray-600"    },
      { icon: Shield,     label: "Privacy Policy",     href: "/privacy", color: "bg-gray-100 text-gray-600"    },
    ],
  },
];

function initialOf(name: string | null, phone: string): string {
  if (name && name.trim()) return name.trim()[0]!.toUpperCase();
  const digits = phone.replace(/\D/g, "");
  return digits.slice(-1) || "U";
}

export default function AccountPage() {
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [phone, setPhone] = useState<string | null>(null);
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loadingCustomer, setLoadingCustomer] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchCustomer = useCallback(async (p: string) => {
    setLoadingCustomer(true);
    try {
      const res = await fetch(`/api/customer?phone=${encodeURIComponent(p)}`);
      if (res.ok) {
        const data = await res.json();
        setCustomer(data.customer);
      }
    } catch {
      setCustomer(null);
    } finally {
      setLoadingCustomer(false);
    }
  }, []);

  useEffect(() => {
    const stored = getStoredPhone();
    if (stored) {
      setPhone(stored);
      fetchCustomer(stored);
    } else {
      setLoadingCustomer(false);
    }
  }, [fetchCustomer]);

  function openEdit() {
    setEditName(customer?.name ?? "");
    setEditEmail(customer?.email ?? "");
    setEditing(true);
  }

  async function saveProfile() {
    if (!phone) return;
    setSaving(true);
    try {
      const res = await fetch("/api/customer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, name: editName, email: editEmail }),
      });
      if (res.ok) {
        await fetchCustomer(phone);
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  }

  function logout() {
    clearStoredPhone();
    setPhone(null);
    setCustomer(null);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* ── Header ── */}
      <div className="bg-white px-4 pt-6 pb-5 border-b border-gray-100">
        <h1 className="text-[20px] font-bold text-gray-900 mb-4">Account</h1>

        {!phone ? (
          <SignedOutCard onSaved={(p) => { setPhone(p); fetchCustomer(p); }} />
        ) : loadingCustomer ? (
          <ProfileSkeleton />
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-emerald-200">
              {initialOf(customer?.name ?? null, phone)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[16px] font-bold text-gray-900 truncate">
                {customer?.name?.trim() || "Add your name"}
              </p>
              <p className="text-[13px] text-gray-500 mt-0.5">{phone}</p>
              {customer?.email && (
                <p className="text-[12px] text-gray-400 truncate">{customer.email}</p>
              )}
              {customer && (
                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                  {customer.orderCount} order{customer.orderCount === 1 ? "" : "s"}
                </p>
              )}
            </div>
            <button
              onClick={openEdit}
              className="text-[12px] font-semibold text-emerald-600 border border-emerald-200 bg-emerald-50 px-3 py-1.5 rounded-xl active:scale-95 transition-transform"
            >
              Edit
            </button>
          </div>
        )}
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        {/* ── Menu sections ── */}
        {menuSections.map((section) => (
          <div key={section.title}>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">
              {section.title}
            </p>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
              {section.items.map(({ icon: Icon, label, href, color }) => {
                const linkHref =
                  label === "My Orders" && phone
                    ? `/orders?phone=${encodeURIComponent(phone)}`
                    : href;
                return (
                  <Link
                    key={label}
                    href={linkHref}
                    prefetch
                    className="flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 transition-colors"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                      <Icon size={16} />
                    </div>
                    <span className="flex-1 text-[14px] font-medium text-gray-800">
                      {label}
                    </span>
                    <ChevronRight size={16} className="text-gray-300" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* ── Notifications toggle ── */}
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">
            Preferences
          </p>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center">
              <Bell size={16} />
            </div>
            <span className="flex-1 text-[14px] font-medium text-gray-800">
              Notifications
            </span>
            <button
              onClick={() => setNotificationsOn((v) => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                notificationsOn ? "bg-emerald-500" : "bg-gray-200"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                  notificationsOn ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* ── App version ── */}
        <p className="text-center text-[11px] text-gray-300 font-medium">
          QuickMart v1.0.0
        </p>

        {/* ── Log out ── */}
        {phone && (
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-100 bg-white text-red-500 text-[14px] font-semibold shadow-sm active:scale-95 transition-transform"
          >
            <LogOut size={16} />
            Log Out
          </button>
        )}
      </div>

      {editing && (
        <EditModal
          name={editName}
          email={editEmail}
          onName={setEditName}
          onEmail={setEditEmail}
          onClose={() => setEditing(false)}
          onSave={saveProfile}
          saving={saving}
        />
      )}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="flex items-center gap-4 animate-pulse">
      <div className="w-16 h-16 rounded-2xl bg-gray-100" />
      <div className="flex-1">
        <div className="h-5 bg-gray-100 rounded w-40 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-32" />
      </div>
      <div className="h-8 w-16 bg-gray-100 rounded-xl" />
    </div>
  );
}

function SignedOutCard({ onSaved }: { onSaved: (phone: string) => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    const p = value.trim();
    if (!/^\d{7,15}$/.test(p.replace(/\D/g, ""))) {
      setError("Enter a valid phone number");
      return;
    }
    setStoredPhone(p);
    onSaved(p);
  }

  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
        <Phone size={20} />
      </div>
      <div className="flex-1">
        <p className="text-[13px] font-semibold text-gray-800 mb-1.5">
          Sign in to see your details
        </p>
        <div className="flex gap-2">
          <input
            type="tel"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(null); }}
            placeholder="Phone number"
            className="flex-1 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <button
            onClick={submit}
            className="text-[12px] font-semibold text-white bg-emerald-500 px-3 py-2 rounded-lg active:scale-95"
          >
            Save
          </button>
        </div>
        {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
      </div>
    </div>
  );
}

function EditModal({
  name, email, onName, onEmail, onClose, onSave, saving,
}: {
  name: string;
  email: string;
  onName: (v: string) => void;
  onEmail: (v: string) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-bold text-gray-900">Edit profile</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => onName(e.target.value)}
            placeholder="Full name"
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => onEmail(e.target.value)}
            placeholder="Email (optional)"
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <button
            onClick={onSave}
            disabled={saving}
            className="mt-2 flex items-center justify-center gap-2 bg-emerald-500 text-white rounded-xl py-3 font-semibold text-[14px] active:scale-[0.98] disabled:opacity-60"
          >
            <Check size={16} />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
