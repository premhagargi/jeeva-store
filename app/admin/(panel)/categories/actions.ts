"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { slugifyName } from "@/scripts/utils";

export async function updateCategory(
  id: string,
  input: {
    name: string;
    emoji?: string | null;
    bgColor?: string | null;
    sortOrder?: number;
  },
) {
  const me = await requireAdmin();
  const name = input.name.trim();
  if (!name) throw new Error("Name is required");

  const slug = slugifyName(name);
  const collision = await prisma.category.findFirst({
    where: { slug, NOT: { id } },
  });
  if (collision) throw new Error("Another category already uses this name");

  await prisma.category.update({
    where: { id },
    data: {
      name,
      slug,
      emoji: input.emoji?.trim() || null,
      bgColor: input.bgColor?.trim() || null,
      sortOrder: Number.isFinite(input.sortOrder) ? Number(input.sortOrder) : 0,
    },
  });

  await logAudit(me.id, "update", "category", id, `name=${name}`);
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function deleteCategory(id: string) {
  const me = await requireAdmin();
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!category) throw new Error("Category not found");
  if (category._count.products > 0) {
    throw new Error(
      `Can't delete: ${category._count.products} product(s) still use this category`,
    );
  }
  await prisma.category.delete({ where: { id } });
  await logAudit(me.id, "delete", "category", id, `name=${category.name}`);
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function createProductInCategory(
  categoryId: string,
  input: {
    name: string;
    quantityValue: number | null;
    unit: string;
    price: number;
    stockQty: number;
    isAvailable?: boolean;
  },
) {
  const me = await requireAdmin();

  const name = input.name.trim();
  const unit = input.unit.trim();
  if (!name) throw new Error("Name is required");
  if (!unit) throw new Error("Unit is required");
  if (!Number.isFinite(input.price) || input.price < 0) throw new Error("Invalid price");
  if (!Number.isInteger(input.stockQty) || input.stockQty < 0) throw new Error("Invalid stock");
  if (
    input.quantityValue != null &&
    (!Number.isFinite(input.quantityValue) || input.quantityValue <= 0)
  ) {
    throw new Error("Invalid quantity");
  }

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw new Error("Category not found");

  const qty = input.quantityValue != null ? input.quantityValue : 1;
  const slug = slugifyName(`${name} ${qty} ${unit}`);
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) throw new Error("A product with the same name + size already exists");

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      categoryId: category.id,
      inventory: {
        create: {
          unit,
          quantityValue: input.quantityValue,
          price: input.price,
          stockQty: input.stockQty,
          isAvailable: input.isAvailable ?? true,
        },
      },
    },
    include: { inventory: true },
  });

  await logAudit(me.id, "create", "product", product.id, `name=${name}`);

  revalidatePath("/admin/products");
  revalidatePath(`/admin/categories/${category.id}`);
  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath(`/category/${category.slug}`);

  return {
    id: product.id,
    name: product.name,
    unit: product.inventory!.unit,
    quantityValue: product.inventory!.quantityValue,
    price: product.inventory!.price ?? 0,
    stockQty: product.inventory!.stockQty,
    isAvailable: product.inventory!.isAvailable,
  };
}

export async function createCategory(formData: FormData) {
  const me = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name is required");
  const slug = slugifyName(name);
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) throw new Error("Category already exists");
  const created = await prisma.category.create({
    data: {
      name,
      slug,
      emoji: String(formData.get("emoji") ?? "").trim() || null,
      bgColor: String(formData.get("bgColor") ?? "").trim() || null,
      sortOrder: Number(formData.get("sortOrder") ?? 0) || 0,
    },
  });
  await logAudit(me.id, "create", "category", created.id, `name=${name}`);
  revalidatePath("/admin/categories");
  revalidatePath("/");
}
