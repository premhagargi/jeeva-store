import Link from "next/link";
import { Search, Flag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const PAGE_SIZE = 50;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; flagged?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const flagged = sp.flagged === "1";

  const where: Prisma.CustomerWhereInput = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { phone: { contains: q.replace(/\D/g, "") || q } },
      { address: { contains: q, mode: "insensitive" } },
    ];
  }
  if (flagged) where.flagged = true;

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      include: {
        _count: { select: { orders: true } },
        orders: {
          select: { total: true, createdAt: true, status: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.customer.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="px-4 py-4 flex flex-col gap-4">
      <form action="/admin/customers" method="get" className="flex flex-col gap-2">
        <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-2.5 shadow-sm">
          <Search size={16} className="text-gray-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name, phone or address..."
            className="flex-1 bg-transparent text-[14px] outline-none"
          />
          {flagged && <input type="hidden" name="flagged" value="1" />}
        </div>
        <div className="flex items-center gap-2">
          <a
            href={flagged ? "/admin/customers" : "/admin/customers?flagged=1"}
            className={`text-[12px] font-semibold px-3 py-1.5 rounded-full ${
              flagged ? "bg-red-500 text-white" : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            {flagged ? "Flagged ✕" : "Flagged only"}
          </a>
          <span className="text-[12px] text-gray-400">
            {total} customer{total === 1 ? "" : "s"}
          </span>
        </div>
      </form>

      <div className="flex flex-col gap-2">
        {customers.length === 0 ? (
          <p className="text-center text-[13px] text-gray-400 py-12">No customers found.</p>
        ) : (
          customers.map((c) => {
            const last = c.orders[0];
            return (
              <Link
                key={c.id}
                href={`/admin/customers/${c.id}`}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 active:bg-gray-50"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-bold text-gray-900 truncate">
                        {c.name ?? "(no name)"}
                      </p>
                      {c.flagged && (
                        <Flag size={12} className="text-red-500 fill-red-500" />
                      )}
                    </div>
                    <p className="text-[12px] text-emerald-600 font-semibold">{c.phone}</p>
                    {c.address && (
                      <p className="text-[11px] text-gray-500 truncate">{c.address}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] text-gray-400">{c._count.orders} orders</p>
                    {last && (
                      <p className="text-[11px] text-gray-500">
                        Last: ₹{last.total}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <PageLink q={q} flagged={flagged} page={page - 1} disabled={page <= 1} label="Prev" />
          <span className="text-[12px] text-gray-500">
            Page {page} / {totalPages}
          </span>
          <PageLink q={q} flagged={flagged} page={page + 1} disabled={page >= totalPages} label="Next" />
        </div>
      )}
    </div>
  );
}

function PageLink({
  q,
  flagged,
  page,
  disabled,
  label,
}: {
  q: string;
  flagged: boolean;
  page: number;
  disabled: boolean;
  label: string;
}) {
  if (disabled) {
    return <span className="text-[12px] text-gray-300 font-semibold px-3 py-1.5">{label}</span>;
  }
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (flagged) params.set("flagged", "1");
  if (page > 1) params.set("page", String(page));
  return (
    <a
      href={`/admin/customers${params.toString() ? `?${params.toString()}` : ""}`}
      className="text-[12px] font-semibold text-emerald-600 px-3 py-1.5 rounded-lg bg-emerald-50"
    >
      {label}
    </a>
  );
}
