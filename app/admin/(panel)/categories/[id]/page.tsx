import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { styleForCategory } from "@/lib/category-style";
import CategoryProductsView from "./CategoryProductsView";

export default async function AdminCategoryDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      products: {
        include: { inventory: true },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!category) notFound();

  const style = styleForCategory({
    name: category.name,
    emoji: category.emoji,
    bgColor: category.bgColor,
  });

  const products = category.products
    .filter((p) => p.inventory)
    .map((p) => ({
      id: p.id,
      name: p.name,
      unit: p.inventory!.unit,
      quantityValue: p.inventory!.quantityValue,
      price: p.inventory!.price ?? 0,
      stockQty: p.inventory!.stockQty,
      isAvailable: p.inventory!.isAvailable,
      imageUrl: p.imageUrl,
    }));

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <Link
          href="/admin/categories"
          className="w-9 h-9 rounded-xl flex items-center justify-center active:bg-gray-100"
        >
          <ChevronLeft size={20} className="text-gray-700" />
        </Link>
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0 ${style.bg}`}
        >
          {style.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold text-gray-900 truncate">{category.name}</p>
          <p className="text-[11px] text-gray-400">
            {products.length} product{products.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <CategoryProductsView
        categoryId={category.id}
        categoryName={category.name}
        initialProducts={products}
      />
    </div>
  );
}
