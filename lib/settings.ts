import { prisma } from "./prisma";

export const SETTINGS = {
  MIN_ORDER_VALUE: "min_order_value",
  DELIVERY_FEE: "delivery_fee",
  FREE_DELIVERY_THRESHOLD: "free_delivery_threshold",
  STORE_OPEN: "store_open",
  STORE_HOURS: "store_hours",
  ANNOUNCEMENT: "announcement",
  CONTACT_PHONE: "contact_phone",
  CONTACT_EMAIL: "contact_email",
} as const;

export async function getSetting(key: string): Promise<string | null> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function getSettings(keys: string[]): Promise<Record<string, string | null>> {
  const rows = await prisma.setting.findMany({ where: { key: { in: keys } } });
  const map: Record<string, string | null> = {};
  for (const k of keys) map[k] = null;
  for (const r of rows) map[r.key] = r.value;
  return map;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function getMinOrderValue(): Promise<number> {
  const v = await getSetting(SETTINGS.MIN_ORDER_VALUE);
  if (!v) return 0;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export async function getDeliveryFee(): Promise<number> {
  const v = await getSetting(SETTINGS.DELIVERY_FEE);
  if (!v) return 0;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export async function getFreeDeliveryThreshold(): Promise<number> {
  const v = await getSetting(SETTINGS.FREE_DELIVERY_THRESHOLD);
  if (!v) return 0;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export async function isStoreOpen(): Promise<boolean> {
  const v = await getSetting(SETTINGS.STORE_OPEN);
  return v == null ? true : v === "1" || v === "true";
}

export interface StorefrontSettings {
  minOrderValue: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  storeOpen: boolean;
  storeHours: string | null;
  announcement: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
}

export async function getStorefrontSettings(): Promise<StorefrontSettings> {
  const map = await getSettings([
    SETTINGS.MIN_ORDER_VALUE,
    SETTINGS.DELIVERY_FEE,
    SETTINGS.FREE_DELIVERY_THRESHOLD,
    SETTINGS.STORE_OPEN,
    SETTINGS.STORE_HOURS,
    SETTINGS.ANNOUNCEMENT,
    SETTINGS.CONTACT_PHONE,
    SETTINGS.CONTACT_EMAIL,
  ]);
  const num = (v: string | null) => {
    if (!v) return 0;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };
  return {
    minOrderValue: num(map[SETTINGS.MIN_ORDER_VALUE]),
    deliveryFee: num(map[SETTINGS.DELIVERY_FEE]),
    freeDeliveryThreshold: num(map[SETTINGS.FREE_DELIVERY_THRESHOLD]),
    storeOpen:
      map[SETTINGS.STORE_OPEN] == null
        ? true
        : map[SETTINGS.STORE_OPEN] === "1" || map[SETTINGS.STORE_OPEN] === "true",
    storeHours: map[SETTINGS.STORE_HOURS],
    announcement: map[SETTINGS.ANNOUNCEMENT],
    contactPhone: map[SETTINGS.CONTACT_PHONE],
    contactEmail: map[SETTINGS.CONTACT_EMAIL],
  };
}
