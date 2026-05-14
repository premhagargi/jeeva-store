"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export default function CategoryLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
        }
      }}
    >
      {children}
    </Link>
  );
}
