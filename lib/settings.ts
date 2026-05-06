import { prisma } from "./prisma";

export const SETTINGS = {
  MIN_ORDER_VALUE: "min_order_value",
} as const;

export async function getSetting(key: string): Promise<string | null> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? null;
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
