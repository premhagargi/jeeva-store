import { prisma } from "@/lib/prisma";
import { styleFor } from "@/lib/category-style";

export const runtime = "nodejs";
export const revalidate = 300;

export async function GET() {
  const rows = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  const categories = rows
    .filter((c) => c._count.products > 0)
    .map((c) => {
      const style = styleFor(c.name);
      return {
        id: c.id,
        slug: c.slug,
        name: c.name,
        productCount: c._count.products,
        emoji: style.emoji,
        bg: style.bg,
      };
    });
  return Response.json({ categories });
}
