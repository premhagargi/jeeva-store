import { prisma } from "./prisma";
import { styleFor } from "./category-style";

export type ProductDetail = {
  id: string;
  slug: string;
  name: string;
  category: { name: string };
  inventory: {
    id: string;
    unit: string;
    quantityValue: number | null;
    price: number | null;
    isAvailable: boolean;
    stockQty: number;
  } | null;
  imageUrl: string | null;
};

export async function getProductBySlug(slug: string): Promise<ProductDetail> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { inventory: true, category: true },
  });

  if (!product || !product.inventory) throw new Error("Product not found");

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: { name: product.category.name },
    inventory: {
      id: product.inventory.id,
      unit: product.inventory.unit,
      quantityValue: product.inventory.quantityValue,
      price: product.inventory.price,
      isAvailable: product.inventory.isAvailable,
      stockQty: product.inventory.stockQty,
    },
    imageUrl: product.imageUrl,
  };
}