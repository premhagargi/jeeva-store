import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ProductRow, { AdminProduct } from "./ProductRow";
import ImportExportBar from "./ImportExportBar";
import SearchBar from "./SearchBar";

const PAGE_SIZE = 50;

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const m = a.length;
  const n = b.length;
  let prev = new Array(n + 1);
  let curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

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

  const nq = normalize(q);
  const hasQuery = nq.length > 0;

  const baseWhere: any = {};
  if (lowStock) {
    baseWhere.inventory = { stockQty: { lt: 10 } };
  }

  let products: AdminProduct[] = [];
  let total = 0;
  let totalPages = 1;

  if (hasQuery) {
    const rows = await prisma.product.findMany({
      where: baseWhere,
      include: { inventory: true, category: true },
      take: 2000,
    });

    const qTokens = nq.split(/\s+/).filter(Boolean);
    const nqCompact = nq.replace(/\s+/g, "");

    const scored = rows
      .filter((p) => p.inventory)
      .map((p) => {
        const name = normalize(p.name);
        const nameCompact = name.replace(/\s+/g, "");
        const nameTokens = name.split(/\s+/).filter(Boolean);
        const cat = normalize(p.category.name);

        let score = 0;
        if (name === nq) score += 1000;
        else if (name.startsWith(nq)) score += 600;
        else if (nameCompact === nqCompact) score += 700;
        else if (nameCompact.startsWith(nqCompact)) score += 450;
        else if (nameCompact.includes(nqCompact) && nqCompact.length >= 3) score += 220;

        for (const t of qTokens) {
          if (nameTokens.includes(t)) {
            score += 120;
            continue;
          }
          if (nameTokens.some((w) => w.startsWith(t))) {
            score += 80;
            continue;
          }
          if (name.includes(t)) {
            score += 40;
            continue;
          }
          let bestDist = Infinity;
          let bestLen = 0;
          for (const w of nameTokens) {
            if (Math.abs(w.length - t.length) > 2) continue;
            const d = levenshtein(w, t);
            if (d < bestDist) {
              bestDist = d;
              bestLen = w.length;
            }
          }
          if (bestDist === 1 && t.length >= 3) {
            score += 50;
            continue;
          }
          if (bestDist === 2 && t.length >= 5 && bestLen >= 5) {
            score += 20;
            continue;
          }
          if (cat.includes(t)) score += 25;
        }

        return { score, p };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score || a.p.name.localeCompare(b.p.name));

    total = scored.length;
    totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    products = scored
      .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
      .map(({ p }) => ({
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
  } else {
    const [rows, count] = await Promise.all([
      prisma.product.findMany({
        where: baseWhere,
        include: { inventory: true, category: true },
        orderBy: { name: "asc" },
        take: PAGE_SIZE,
        skip: (page - 1) * PAGE_SIZE,
      }),
      prisma.product.count({ where: baseWhere }),
    ]);
    total = count;
    totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    products = rows
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
  }

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
    <a
      href={`/admin/products${params.toString() ? `?${params.toString()}` : ""}`}
      className="text-[12px] font-semibold text-emerald-600 px-3 py-1.5 rounded-lg bg-emerald-50"
    >
      {label}
    </a>
  );
}
