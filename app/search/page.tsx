import Link from "next/link";
import { ChevronLeft, Search as SearchIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { styleFor } from "@/lib/category-style";
import ProductCard from "@/app/components/products/ProductCard";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const terms = query.split(/\s+/).filter(Boolean);

  let products: Awaited<ReturnType<typeof loadProducts>> = [];
  if (terms.length > 0) {
    products = await loadProducts(terms);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-2">
        <Link
          href="/"
          className="w-9 h-9 rounded-xl flex items-center justify-center active:bg-gray-100"
        >
          <ChevronLeft size={20} className="text-gray-700" />
        </Link>

        <form action="/search" method="get" className="flex-1">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5">
            <SearchIcon size={16} className="text-gray-400 shrink-0" />
            <input
              name="q"
              defaultValue={query}
              autoFocus
              placeholder="Search products, categories..."
              className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
            />
          </div>
        </form>
      </div>

      {query === "" ? (
        <div className="px-8 py-16 text-center">
          <div className="text-5xl mb-3">🔎</div>
          <p className="text-[14px] text-gray-500">Type to search across all products.</p>
        </div>
      ) : products.length === 0 ? (
        <div className="px-8 py-16 text-center">
          <div className="text-5xl mb-3">🤔</div>
          <p className="text-[14px] font-semibold text-gray-700">No matches for "{query}"</p>
          <p className="text-[12px] text-gray-400 mt-1">Try a shorter or different term.</p>
        </div>
      ) : (
        <>
          <p className="px-4 pt-4 pb-2 text-[12px] text-gray-500">
            {products.length} result{products.length === 1 ? "" : "s"} for "{query}"
          </p>
          <div className="px-4 pb-4 grid grid-cols-2 gap-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

async function loadProducts(terms: string[]) {
  const rows = await prisma.product.findMany({
    where: {
      AND: terms.map((t) => ({
        OR: [
          { name: { contains: t, mode: "insensitive" as const } },
          { category: { name: { contains: t, mode: "insensitive" as const } } },
        ],
      })),
    },
    include: { inventory: true, category: true },
    orderBy: { name: "asc" },
    take: 100,
  });

  return rows
    .filter((p) => p.inventory)
    .map((p) => {
      const inv = p.inventory!;
      const style = styleFor(p.category.name);
      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        unit: inv.unit,
        quantityValue: inv.quantityValue,
        price: inv.price ?? 0,
        emoji: style.emoji,
        bg: style.bg,
        imageUrl: p.imageUrl,
        isAvailable: inv.isAvailable && inv.stockQty > 0,
      };
    });
}
