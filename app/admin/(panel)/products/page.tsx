import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ProductRow, { AdminProduct } from "./ProductRow";
import ImportExportBar from "./ImportExportBar";
import SearchBar from "./SearchBar";

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

  const baseWhere: Parameters<typeof prisma.product.findMany>[0]["where"] = {};
  if (lowStock) {
    baseWhere.inventory = { stockQty: { lt: 10 } };
  }

  const where = q
    ? {
        ...baseWhere,
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { category: { name: { contains: q, mode: "insensitive" as const } } },
        ],
      }
    : baseWhere;

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

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

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

      <ImportExportBar />

      <SearchBar initialQuery={q} lowStock={lowStock} total={total} />

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
    <Link
      href={`/admin/products${params.toString() ? `?${params.toString()}` : ""}`}
      className="text-[12px] font-semibold text-emerald-600 px-3 py-1.5 rounded-lg bg-emerald-50"
    >
      {label}
    </Link>
  );
}
