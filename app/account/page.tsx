"use client";

import { useState } from "react";
import {
  MapPin, ShoppingBag, Heart, Tag, HelpCircle,
  FileText, LogOut, ChevronRight, Bell, Shield,
} from "lucide-react";
import Link from "next/link";

const menuSections = [
  {
    title: "My Activity",
    items: [
      { icon: ShoppingBag, label: "My Orders",        href: "/orders",  color: "bg-emerald-50 text-emerald-600" },
      { icon: MapPin,      label: "Saved Addresses",  href: "/addresses",color: "bg-blue-50 text-blue-600"     },
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

export default function AccountPage() {
  const [notificationsOn, setNotificationsOn] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* ── Header ── */}
      <div className="bg-white px-4 pt-6 pb-5 border-b border-gray-100">
        <h1 className="text-[20px] font-bold text-gray-900 mb-4">Account</h1>

        {/* Profile row */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-emerald-200">
            R
          </div>
          <div className="flex-1">
            <p className="text-[16px] font-bold text-gray-900">Rahul Kumar</p>
            <p className="text-[13px] text-gray-400 mt-0.5">+91 98765 43210</p>
            <p className="text-[12px] text-gray-400">rahul@email.com</p>
          </div>
          <button className="text-[12px] font-semibold text-emerald-600 border border-emerald-200 bg-emerald-50 px-3 py-1.5 rounded-xl active:scale-95 transition-transform">
            Edit
          </button>
        </div>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        {/* ── Menu sections ── */}
        {menuSections.map((section) => (
          <div key={section.title}>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">
              {section.title}
            </p>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
              {section.items.map(({ icon: Icon, label, href, color }) => (
                <Link
                  key={label}
                  href={href}
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
              ))}
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
            {/* Toggle */}
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
        <button className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-100 bg-white text-red-500 text-[14px] font-semibold shadow-sm active:scale-95 transition-transform">
          <LogOut size={16} />
          Log Out
        </button>
      </div>
    </div>
  );
}