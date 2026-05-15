"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { getCloudinaryConfig, signParams, deleteFromCloudinary } from "@/lib/cloudinary";
import { logAudit } from "@/lib/audit";

export async function getGalleryUploadSignature(productId: string) {
  await requireAdmin();
  const cfg = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "jeeva-store/products";
  const publicId = `${folder}/${productId}-gallery-${timestamp}`;
  const signature = signParams({ public_id: publicId, timestamp }, cfg.apiSecret);
  return { signature, timestamp, apiKey: cfg.apiKey, cloudName: cfg.cloudName, publicId };
}

export async function addProductImage(
  productId: string,
  url: string,
  publicId: string,
  altText?: string,
) {
  const me = await requireAdmin();
  const count = await prisma.productImage.count({ where: { productId } });
  await prisma.productImage.create({
    data: {
      productId,
      url,
      publicId,
      altText: altText?.trim() || null,
      sortOrder: count,
    },
  });
  await logAudit(me.id, "add_image", "product", productId);
  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath("/");
}

export async function removeProductImageById(imageId: string) {
  const me = await requireAdmin();
  const img = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!img) return;
  if (img.publicId) {
    try {
      await deleteFromCloudinary(img.publicId);
    } catch {}
  }
  await prisma.productImage.delete({ where: { id: imageId } });
  await logAudit(me.id, "remove_image", "product", img.productId);
  revalidatePath(`/admin/products/${img.productId}/edit`);
}

export async function updateProductImageAlt(imageId: string, altText: string) {
  const me = await requireAdmin();
  const img = await prisma.productImage.update({
    where: { id: imageId },
    data: { altText: altText.trim() || null },
  });
  await logAudit(me.id, "update_image", "product", img.productId);
  revalidatePath(`/admin/products/${img.productId}/edit`);
}
