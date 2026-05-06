"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { setSetting, SETTINGS } from "@/lib/settings";

export async function saveStoreSettings(formData: FormData) {
  await requireAdmin();

  const minOrderRaw = String(formData.get("minOrderValue") ?? "0").trim();
  const minOrder = Number(minOrderRaw);
  if (!Number.isFinite(minOrder) || minOrder < 0) {
    throw new Error("Invalid minimum order value");
  }

  await setSetting(SETTINGS.MIN_ORDER_VALUE, String(minOrder));

  revalidatePath("/admin/settings");
  revalidatePath("/cart");
  revalidatePath("/checkout");
}
