import { prisma } from "@/lib/prisma";
import { styleFor } from "@/lib/category-style";
import type { NextRequest } from "next";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const terms = q.split(/\s+/).filter(Boolean);

  if (terms.length === 0) {
    return Response.json({ products: [] });
  }

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

  const products = rows
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

  return Response.json({ products });
}