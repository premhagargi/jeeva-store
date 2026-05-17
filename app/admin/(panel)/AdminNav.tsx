"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Settings,
  ShieldCheck,
  ScrollText,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/admins", label: "Admins", icon: ShieldCheck },
  { href: "/admin/audit", label: "Audit", icon: ScrollText },
];

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="px-4 pb-2 pt-1 flex gap-2 overflow-x-auto no-scrollbar">
      {NAV.map((n) => {
        const active = isActive(pathname, n.href);
        const Icon = n.icon;
        return (
          <Link
            key={n.href}
            href={n.href}
            prefetch={true}
            className={`shrink-0 px-3 py-1.5 rounded-full text-[13px] font-semibold flex items-center gap-1.5 transition-colors ${
              active
                ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200"
                : "bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
            }`}
          >
            <Icon size={14} strokeWidth={active ? 2.5 : 2} />
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}
