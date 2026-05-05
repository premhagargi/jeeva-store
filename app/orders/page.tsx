"use client";

import { useState } from "react";
import OrderCard, { Order } from "../components/orders/OrderCard";
import EmptyOrders from "../components/orders/EmptyOrders";

// ── Mock data ──────────────────────────────────────────────────────────────────
const ALL_ORDERS: Order[] = [
  {
    id: "QM204819",
    date: "Today",
    time: "2:45 PM",
    status: "out_for_delivery",
    deliveryTime: undefined,
    address: "Home — Bhagya Nagar, 3rd Cross, Gokak, Karnataka 591307",
    items: [
      { id: "1", name: "Amul Full Cream Milk", qty: 2, unit: "500 ml", price: 58, emoji: "🥛", bg: "bg-yellow-50" },
      { id: "2", name: "Whole Wheat Bread",    qty: 1, unit: "400 g",  price: 42, emoji: "🍞", bg: "bg-amber-50" },
      { id: "3", name: "Farm Fresh Eggs",      qty: 1, unit: "6 pcs",  price: 65, emoji: "🥚", bg: "bg-orange-50" },
    ],
    deliveryFee: 0,
    discount: 15,
    total: 150,
  },
  {
    id: "QM204751",
    date: "Yesterday",
    time: "10:12 AM",
    status: "delivered",
    deliveryTime: "Delivered in 9 mins",
    address: "Home — Bhagya Nagar, 3rd Cross, Gokak, Karnataka 591307",
    items: [
      { id: "4", name: "Tata Salt",           qty: 1, unit: "1 kg",   price: 24, emoji: "🧂", bg: "bg-blue-50"  },
      { id: "5", name: "Fortune Sunflower Oil",qty: 1, unit: "1 L",   price: 142, emoji: "🫙", bg: "bg-yellow-50" },
      { id: "6", name: "Aashirvaad Atta",     qty: 1, unit: "5 kg",   price: 270, emoji: "🌾", bg: "bg-amber-50" },
      { id: "7", name: "Maggi Noodles",       qty: 3, unit: "70 g",   price: 42,  emoji: "🍜", bg: "bg-red-50"  },
    ],
    deliveryFee: 0,
    discount: 28,
    total: 450,
  },
  {
    id: "QM204612",
    date: "24 Apr",
    time: "7:30 PM",
    status: "delivered",
    deliveryTime: "Delivered in 6 mins",
    address: "Home — Bhagya Nagar, 3rd Cross, Gokak, Karnataka 591307",
    items: [
      { id: "8",  name: "Colgate Strong Teeth", qty: 1, unit: "200 g", price: 95,  emoji: "🦷", bg: "bg-sky-50"    },
      { id: "9",  name: "Head & Shoulders",     qty: 1, unit: "340 ml",price: 320, emoji: "🧴", bg: "bg-blue-50"  },
      { id: "10", name: "Dettol Handwash",      qty: 2, unit: "200 ml",price: 70,  emoji: "🧼", bg: "bg-green-50" },
    ],
    deliveryFee: 15,
    discount: 0,
    total: 500,
  },
  {
    id: "QM204480",
    date: "22 Apr",
    time: "1:15 PM",
    status: "cancelled",
    deliveryTime: undefined,
    address: "Home — Bhagya Nagar, 3rd Cross, Gokak, Karnataka 591307",
    items: [
      { id: "11", name: "Cadbury Dairy Milk", qty: 2, unit: "45 g", price: 50, emoji: "🍫", bg: "bg-amber-50" },
    ],
    deliveryFee: 0,
    discount: 0,
    total: 100,
  },
];

// ── Filter tabs ────────────────────────────────────────────────────────────────
const TABS = [
  { key: "all",      label: "All" },
  { key: "active",   label: "Active" },
  { key: "delivered",label: "Delivered" },
  { key: "cancelled",label: "Cancelled" },
] as const;

type Tab = (typeof TABS)[number]["key"];

function filterOrders(orders: Order[], tab: Tab): Order[] {
  if (tab === "all")       return orders;
  if (tab === "active")    return orders.filter((o) => o.status === "out_for_delivery" || o.status === "processing");
  if (tab === "delivered") return orders.filter((o) => o.status === "delivered");
  if (tab === "cancelled") return orders.filter((o) => o.status === "cancelled");
  return orders;
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const filtered = filterOrders(ALL_ORDERS, activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 pt-5 pb-0">
        <h1 className="text-[20px] font-bold text-gray-900 mb-3">My Orders</h1>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Order list ── */}
      <div className="px-4 py-4 flex flex-col gap-4">
        {filtered.length === 0 ? (
          <EmptyOrders />
        ) : (
          filtered.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </div>
    </div>
  );
}