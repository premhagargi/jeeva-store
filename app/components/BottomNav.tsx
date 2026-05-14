"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, ShoppingBag, ShoppingCart } from "lucide-react";

const tabs = [
  { label: "Home",   href: "/",       icon: Home },
  { label: "Orders", href: "/orders", icon: ShoppingBag },
  { label: "Cart",   href: "/cart",   icon: ShoppingCart },
];

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname?.startsWith("/product/")) return null;

  return (
    <>
      {/* Spacer so page content isn't hidden behind the bar */}
      <div className="h-20" />

      <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto">
        {/* Frosted card */}
        <div className="mx-3 mb-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.10)] border border-gray-100 px-2 py-2 flex items-center justify-around">
          {tabs.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-1 flex-1 py-1 group"
              >
                {/* Icon pill */}
                <div
                  className={`relative flex items-center justify-center w-12 h-8 rounded-xl transition-all duration-200 ${
                    active
                      ? "bg-emerald-500 shadow-md shadow-emerald-200"
                      : "group-hover:bg-gray-100"
                  }`}
                >
                  <Icon
                    size={20}
                    strokeWidth={active ? 2.5 : 1.8}
                    className={`transition-colors ${
                      active ? "text-white" : "text-gray-400 group-hover:text-gray-600"
                    }`}
                  />
                </div>

                {/* Label */}
                <span
                  className={`text-[11px] font-semibold tracking-tight transition-colors ${
                    active ? "text-emerald-600" : "text-gray-400"
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* iOS home indicator spacer */}
        <div className="h-safe-bottom bg-transparent" />
      </nav>
    </>
  );
}