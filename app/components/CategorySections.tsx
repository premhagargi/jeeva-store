import { prisma } from "@/lib/prisma";
import { styleFor } from "@/lib/category-style";
import CategoryLink from "./CategoryLink";

export default async function CategorySections() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  const live = categories.filter((c) => c._count.products > 0);

  return (
    <div className="px-4 py-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-bold text-gray-900 tracking-tight">Shop by category</h2>
        <span className="text-[11px] font-semibold text-gray-400">
          {live.length} categories
        </span>
      </div>

      <div className="grid grid-cols-4 gap-x-3 gap-y-5">
        {live.map((cat) => {
          const style = styleFor(cat.name);
          return (
            <CategoryLink
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="flex flex-col items-center gap-2 group w-full"
            >
              <div
                className={`w-full aspect-square rounded-2xl flex items-center justify-center text-4xl ${style.bg} transition-all duration-150 group-active:scale-95 group-hover:brightness-95 shadow-sm`}
              >
                {style.emoji}
              </div>
              <span className="text-[11.5px] font-semibold text-gray-700 text-center leading-snug line-clamp-2 w-full px-0.5">
                {cat.name}
              </span>
              <span className="text-[10px] text-gray-400 -mt-1.5">
                {cat._count.products} items
              </span>
            </CategoryLink>
          );
        })}
      </div>
    </div>
  );
}
