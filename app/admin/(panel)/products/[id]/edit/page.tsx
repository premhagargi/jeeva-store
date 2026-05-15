import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "../../ProductForm";
import Gallery from "./Gallery";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        inventory: true,
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { name: true },
    }),
  ]);

  if (!product || !product.inventory) notFound();

  return (
    <div className="flex flex-col gap-4">
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
      <div className="px-4">
        <Gallery
          productId={product.id}
          images={product.images.map((i) => ({
            id: i.id,
            url: i.url,
            altText: i.altText,
          }))}
        />
      </div>
    </div>
  );
}
