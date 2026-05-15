import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

function csvCell(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  await requireAdmin();

  const rows = await prisma.product.findMany({
    include: { inventory: true, category: true },
    orderBy: { name: "asc" },
  });

  const header = [
    "id",
    "name",
    "category",
    "unit",
    "quantityValue",
    "price",
    "stockQty",
    "isAvailable",
    "imageUrl",
  ];
  const lines = [header.join(",")];
  for (const p of rows) {
    lines.push(
      [
        p.id,
        p.name,
        p.category.name,
        p.inventory?.unit ?? "",
        p.inventory?.quantityValue ?? "",
        p.inventory?.price ?? "",
        p.inventory?.stockQty ?? "",
        p.inventory?.isAvailable ? "1" : "0",
        p.imageUrl ?? "",
      ]
        .map(csvCell)
        .join(","),
    );
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="products-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
