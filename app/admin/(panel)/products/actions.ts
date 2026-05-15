"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { getCloudinaryConfig, signParams, deleteFromCloudinary } from "@/lib/cloudinary";
import { slugifyName } from "@/scripts/utils";
import { logAudit } from "@/lib/audit";
import type { ProductInput } from "./types";

function validateInput(input: ProductInput): string | null {
  if (!input.name.trim()) return "Name is required";
  if (!input.categoryName.trim()) return "Category is required";
  if (!input.unit.trim()) return "Unit is required";
  if (!Number.isFinite(input.price) || input.price < 0) return "Invalid price";
  if (!Number.isInteger(input.stockQty) || input.stockQty < 0) return "Invalid stock quantity";
  if (input.quantityValue != null && (!Number.isFinite(input.quantityValue) || input.quantityValue <= 0)) {
    return "Invalid quantity value";
  }
  return null;
}

async function upsertCategory(name: string) {
  const trimmed = name.trim();
  const slug = slugifyName(trimmed);
  return prisma.category.upsert({
    where: { slug },
    update: { name: trimmed },
    create: { name: trimmed, slug },
  });
}

function buildProductSlug(name: string, quantityValue: number | null, unit: string) {
  const qty = quantityValue != null ? quantityValue : 1;
  return slugifyName(`${name} ${qty} ${unit}`);
}

export async function updateInventory(
  productId: string,
  data: { price?: number; stockQty?: number; isAvailable?: boolean },
) {
  const me = await requireAdmin();

  const patch: { price?: number; stockQty?: number; isAvailable?: boolean } = {};
  if (data.price !== undefined && Number.isFinite(data.price) && data.price >= 0) {
    patch.price = data.price;
  }
  if (
    data.stockQty !== undefined &&
    Number.isInteger(data.stockQty) &&
    data.stockQty >= 0
  ) {
    patch.stockQty = data.stockQty;
  }
  if (data.isAvailable !== undefined) {
    patch.isAvailable = data.isAvailable;
  }

  if (Object.keys(patch).length === 0) return;

  await prisma.inventory.update({
    where: { productId },
    data: patch,
  });

  await logAudit(me.id, "inventory_update", "product", productId, JSON.stringify(patch));

  revalidatePath("/admin/products");
  revalidatePath(`/category`);
  revalidatePath("/");
}

export async function getUploadSignature(productId: string) {
  await requireAdmin();
  const cfg = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "jeeva-store/products";
  const publicId = `${folder}/${productId}-${timestamp}`;
  const signature = signParams(
    { public_id: publicId, timestamp },
    cfg.apiSecret,
  );
  return {
    signature,
    timestamp,
    apiKey: cfg.apiKey,
    cloudName: cfg.cloudName,
    publicId,
  };
}

export async function saveProductImage(
  productId: string,
  imageUrl: string,
  imagePublicId: string,
) {
  await requireAdmin();

  const existing = await prisma.product.findUnique({
    where: { id: productId },
    select: { imagePublicId: true },
  });
  if (existing?.imagePublicId && existing.imagePublicId !== imagePublicId) {
    try {
      await deleteFromCloudinary(existing.imagePublicId);
    } catch {}
  }

  await prisma.product.update({
    where: { id: productId },
    data: { imageUrl, imagePublicId },
  });

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/category", "page");
  revalidatePath("/product", "page");
}

export async function removeProductImage(productId: string) {
  await requireAdmin();

  const existing = await prisma.product.findUnique({
    where: { id: productId },
    select: { imagePublicId: true },
  });
  if (existing?.imagePublicId) {
    try {
      await deleteFromCloudinary(existing.imagePublicId);
    } catch {}
  }

  await prisma.product.update({
    where: { id: productId },
    data: { imageUrl: null, imagePublicId: null },
  });

  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function createProduct(input: ProductInput) {
  const me = await requireAdmin();
  const err = validateInput(input);
  if (err) throw new Error(err);

  const category = await upsertCategory(input.categoryName);
  const slug = buildProductSlug(input.name.trim(), input.quantityValue, input.unit.trim());

  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) {
    throw new Error("A product with the same name + size already exists");
  }

  const product = await prisma.product.create({
    data: {
      name: input.name.trim(),
      slug,
      categoryId: category.id,
      inventory: {
        create: {
          unit: input.unit.trim(),
          quantityValue: input.quantityValue,
          price: input.price,
          stockQty: input.stockQty,
          isAvailable: input.isAvailable,
        },
      },
    },
  });

  await logAudit(me.id, "create", "product", product.id, `name=${input.name}`);

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath(`/category/${category.slug}`);

  redirect(`/admin/products?created=${product.id}`);
}

export async function updateProduct(productId: string, input: ProductInput) {
  const me = await requireAdmin();
  const err = validateInput(input);
  if (err) throw new Error(err);

  const category = await upsertCategory(input.categoryName);
  const slug = buildProductSlug(input.name.trim(), input.quantityValue, input.unit.trim());

  const collision = await prisma.product.findFirst({
    where: { slug, NOT: { id: productId } },
  });
  if (collision) {
    throw new Error("Another product already has the same name + size");
  }

  await prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data: {
        name: input.name.trim(),
        slug,
        categoryId: category.id,
      },
    }),
    prisma.inventory.update({
      where: { productId },
      data: {
        unit: input.unit.trim(),
        quantityValue: input.quantityValue,
        price: input.price,
        stockQty: input.stockQty,
        isAvailable: input.isAvailable,
      },
    }),
  ]);

  await logAudit(me.id, "update", "product", productId, `name=${input.name}`);

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath(`/category/${category.slug}`);
  revalidatePath(`/product/${slug}`);

  redirect(`/admin/products?updated=${productId}`);
}

export async function deleteProduct(productId: string) {
  const me = await requireAdmin();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { _count: { select: { orderItems: true } }, category: true },
  });
  if (!product) throw new Error("Product not found");

  if (product._count.orderItems > 0) {
    throw new Error(
      "This product has past orders and can't be deleted. Toggle availability off instead.",
    );
  }

  if (product.imagePublicId) {
    try {
      await deleteFromCloudinary(product.imagePublicId);
    } catch {}
  }

  await prisma.$transaction([
    prisma.inventory.deleteMany({ where: { productId } }),
    prisma.product.delete({ where: { id: productId } }),
  ]);

  await logAudit(me.id, "delete", "product", productId, `name=${product.name}`);

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath(`/category/${product.category.slug}`);
}
