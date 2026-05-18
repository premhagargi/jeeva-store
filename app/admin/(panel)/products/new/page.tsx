import { prisma } from "@/lib/prisma";
import ProductForm from "../ProductForm";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { name: true },
  });

  return (
    <ProductForm
      mode="create"
      categories={categories}
      initial={{
        name: "",
        categoryName: "",
        unit: "",
        quantityValue: null,
        price: 0,
        stockQty: 100,
        isAvailable: true,
        expiryDate: null,
      }}
    />
  );
}
