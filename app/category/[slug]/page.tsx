import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { styleFor } from "@/lib/category-style";
import ProductCard from "@/app/components/products/ProductCard";

export const revalidate = 60;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        include: { inventory: true },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!category) notFound();

  const style = styleFor(category.name);
  const products = category.products
    .filter((p) => p.inventory)
    .map((p) => {
      const inv = p.inventory!;
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

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-2">
        <Link
          href="/"
          className="w-9 h-9 rounded-xl flex items-center justify-center active:bg-gray-100"
        >
          <ChevronLeft size={20} className="text-gray-700" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-[16px] font-bold text-gray-900 truncate">{category.name}</h1>
          <p className="text-[11px] text-gray-400">{products.length} products</p>
        </div>
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-2xl ${style.bg}`}>
          {style.emoji}
        </span>
      </div>

      {products.length === 0 ? (
        <div className="px-8 py-20 text-center">
          <p className="text-[14px] text-gray-500">No products in this category yet.</p>
        </div>
      ) : (
        <div className="px-4 py-4 grid grid-cols-2 gap-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
