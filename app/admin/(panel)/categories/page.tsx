import { prisma } from "@/lib/prisma";
import CategoryRow from "./CategoryRow";
import { createCategory } from "./actions";
import { CATEGORY_BG_PALETTE } from "@/lib/category-style";

export default async function CategoriesPage() {
  const rows = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="px-4 py-4 flex flex-col gap-4">
      <details className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
        <summary className="text-[14px] font-bold text-gray-900 cursor-pointer">
          + New category
        </summary>
        <form action={createCategory} className="mt-3 flex flex-col gap-2">
          <input
            name="name"
            placeholder="Category name"
            required
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              name="emoji"
              placeholder="Emoji (optional)"
              maxLength={4}
              className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none"
            />
            <input
              name="sortOrder"
              type="number"
              placeholder="Sort order (0)"
              defaultValue={0}
              className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none"
            />
          </div>
          <select
            name="bgColor"
            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-[14px] outline-none"
          >
            <option value="">Auto background</option>
            {CATEGORY_BG_PALETTE.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-emerald-500 text-white font-bold text-[14px] py-2.5 rounded-xl"
          >
            Create category
          </button>
        </form>
      </details>

      <div className="flex flex-col gap-2">
        {rows.map((c) => (
          <CategoryRow
            key={c.id}
            category={{
              id: c.id,
              name: c.name,
              emoji: c.emoji,
              bgColor: c.bgColor,
              sortOrder: c.sortOrder,
              productCount: c._count.products,
            }}
          />
        ))}
      </div>
    </div>
  );
}
