import Link from "next/link";
import { Search, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ProductRow, { AdminProduct } from "./ProductRow";

const PAGE_SIZE = 50;

export default async function AdminProducts({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    page?: string;
    lowStock?: string;
    created?: string;
    updated?: string;
  }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const lowStock = sp.lowStock === "1";

  const terms = q.split(/\s+/).filter(Boolean);

  const where: any = {};
  if (terms.length > 0) {
    where.AND = terms.map((t) => ({
      OR: [
        { name: { contains: t, mode: "insensitive" } },
        { category: { name: { contains: t, mode: "insensitive" } } },
      ],
    }));
  }
  if (lowStock) {
    where.inventory = { stockQty: { lt: 10 } };
  }

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { inventory: true, category: true },
      orderBy: { name: "asc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  const products: AdminProduct[] = rows
    .filter((p) => p.inventory)
    .map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category.name,
      unit: p.inventory!.unit,
      quantityValue: p.inventory!.quantityValue,
      price: p.inventory!.price ?? 0,
      stockQty: p.inventory!.stockQty,
      isAvailable: p.inventory!.isAvailable,
      imageUrl: p.imageUrl,
    }));

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="px-4 py-4 flex flex-col gap-4">
      {(sp.created || sp.updated) && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-emerald-700">
          {sp.created ? "✅ Product created" : "✅ Product updated"}
        </div>
      )}

      <Link
        href="/admin/products/new"
        className="flex items-center justify-center gap-2 bg-emerald-500 text-white font-bold text-[14px] py-3 rounded-2xl shadow-md shadow-emerald-200 active:scale-[0.98] transition-transform"
      >
        <Plus size={16} />
        New product
      </Link>

      <form action="/admin/products" method="get" className="flex flex-col gap-2">
        <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-2.5 shadow-sm">
          <Search size={16} className="text-gray-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search products or categories..."
            className="flex-1 bg-transparent text-[14px] text-gray-800 outline-none"
          />
          {lowStock && <input type="hidden" name="lowStock" value="1" />}
        </div>
        <div className="flex items-center gap-2">
          <a
            href={lowStock ? "/admin/products" : "/admin/products?lowStock=1"}
            className={`text-[12px] font-semibold px-3 py-1.5 rounded-full ${
              lowStock ? "bg-red-500 text-white" : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            {lowStock ? "Low stock ✕" : "Low stock only"}
          </a>
          <span className="text-[12px] text-gray-400">
            {total} result{total === 1 ? "" : "s"}
          </span>
        </div>
      </form>

      <div className="flex flex-col gap-3">
        {products.length === 0 ? (
          <p className="text-center text-[13px] text-gray-400 py-12">No products found.</p>
        ) : (
          products.map((p) => <ProductRow key={p.id} product={p} />)
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <PageLink q={q} lowStock={lowStock} page={page - 1} disabled={page <= 1} label="Prev" />
          <span className="text-[12px] text-gray-500">
            Page {page} / {totalPages}
          </span>
          <PageLink
            q={q}
            lowStock={lowStock}
            page={page + 1}
            disabled={page >= totalPages}
            label="Next"
          />
        </div>
      )}
    </div>
  );
}

function PageLink({
  q,
  lowStock,
  page,
  disabled,
  label,
}: {
  q: string;
  lowStock: boolean;
  page: number;
  disabled: boolean;
  label: string;
}) {
  if (disabled) {
    return <span className="text-[12px] text-gray-300 font-semibold px-3 py-1.5">{label}</span>;
  }
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (lowStock) params.set("lowStock", "1");
  if (page > 1) params.set("page", String(page));
  return (
    <a
      href={`/admin/products${params.toString() ? `?${params.toString()}` : ""}`}
      className="text-[12px] font-semibold text-emerald-600 px-3 py-1.5 rounded-lg bg-emerald-50"
    >
      {label}
    </a>
  );
}
