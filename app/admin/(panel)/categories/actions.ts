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
