"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { setSetting, SETTINGS } from "@/lib/settings";
import { logAudit } from "@/lib/audit";

function nonNegativeNumber(raw: string, label: string): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) throw new Error(`Invalid ${label}`);
  return n;
}

export async function saveStoreSettings(formData: FormData) {
  const me = await requireAdmin();

  const minOrder = nonNegativeNumber(
    String(formData.get("minOrderValue") ?? "0"),
    "minimum order value",
  );
  const deliveryFee = nonNegativeNumber(
    String(formData.get("deliveryFee") ?? "0"),
    "delivery fee",
  );
  const freeThreshold = nonNegativeNumber(
    String(formData.get("freeDeliveryThreshold") ?? "0"),
    "free delivery threshold",
  );
  const storeOpen = formData.get("storeOpen") === "on" ? "1" : "0";
  const storeHours = String(formData.get("storeHours") ?? "").trim();
  const announcement = String(formData.get("announcement") ?? "").trim();
  const contactPhone = String(formData.get("contactPhone") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();

  await Promise.all([
    setSetting(SETTINGS.MIN_ORDER_VALUE, String(minOrder)),
    setSetting(SETTINGS.DELIVERY_FEE, String(deliveryFee)),
    setSetting(SETTINGS.FREE_DELIVERY_THRESHOLD, String(freeThreshold)),
    setSetting(SETTINGS.STORE_OPEN, storeOpen),
    setSetting(SETTINGS.STORE_HOURS, storeHours),
    setSetting(SETTINGS.ANNOUNCEMENT, announcement),
    setSetting(SETTINGS.CONTACT_PHONE, contactPhone),
    setSetting(SETTINGS.CONTACT_EMAIL, contactEmail),
  ]);

  await logAudit(me.id, "update", "settings", null);

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  revalidatePath("/cart");
  revalidatePath("/checkout");
}
