import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "../../ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { inventory: true, category: true },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { name: true },
    }),
  ]);

  if (!product || !product.inventory) notFound();

  return (
    <ProductForm
      mode="edit"
      productId={product.id}
      categories={categories}
      initial={{
        name: product.name,
        categoryName: product.category.name,
        unit: product.inventory.unit,
        quantityValue: product.inventory.quantityValue,
        price: product.inventory.price ?? 0,
        stockQty: product.inventory.stockQty,
        isAvailable: product.inventory.isAvailable,
      }}
    />
  );
}
