"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { getStorefrontSettings } from "@/lib/settings";
import { revalidatePath } from "next/cache";

export type BillType = "walkin" | "online";

export interface CreateBillInput {
  type: BillType;
  phone?: string;
  name?: string;
  address?: string;
  notes?: string;
  discount?: number;
  items: { productId: string; qty: number }[];
}

const WALKIN_PHONE = "WALKIN";

export async function createBill(
  input: CreateBillInput,
): Promise<{ orderId: string }> {
  await requireAdmin();

  if (input.items.length === 0) throw new Error("No items added to bill");

  const isOnline = input.type === "online";
  const phone = isOnline
    ? input.phone?.trim() ?? ""
    : input.phone?.trim() || WALKIN_PHONE;
  const name = input.name?.trim() || null;
  const address = isOnline
    ? input.address?.trim() ?? ""
    : "Walk-in customer";

  if (isOnline && phone.length < 7)
    throw new Error("Valid phone required for online orders");
  if (isOnline && !address)
    throw new Error("Delivery address required for online orders");

  const productIds = input.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { inventory: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  for (const line of input.items) {
    if (!byId.has(line.productId)) throw new Error("Product not found");
    if (!byId.get(line.productId)!.inventory) throw new Error("Product has no inventory");
  }

  const itemTotal = input.items.reduce((s, i) => {
    const p = byId.get(i.productId)!;
    return s + (p.inventory!.price ?? 0) * i.qty;
  }, 0);

  let deliveryFee = 0;
  if (isOnline) {
    const settings = await getStorefrontSettings();
    deliveryFee =
      settings.freeDeliveryThreshold > 0 &&
      itemTotal >= settings.freeDeliveryThreshold
        ? 0
        : settings.deliveryFee;
  }

  const discount = Math.max(0, input.discount ?? 0);
  const total = Math.max(0, itemTotal + deliveryFee - discount);

  const customer = await prisma.customer.upsert({
    where: { phone },
    update: { name: name || undefined },
    create: { phone, name: name || undefined, address },
  });

  const order = await prisma.$transaction(async (tx) => {
    for (const line of input.items) {
      const p = byId.get(line.productId)!;
      const result = await tx.inventory.updateMany({
        where: { productId: line.productId, stockQty: { gte: line.qty } },
        data: { stockQty: { decrement: line.qty } },
      });
      if (result.count === 0)
        throw new Error(`Insufficient stock: ${p.name}`);
    }

    const status = isOnline ? "PROCESSING" : "DELIVERED";
    return tx.order.create({
      data: {
        customerId: customer.id,
        phone,
        customerName: name,
        address,
        customerNotes: input.notes?.trim() || null,
        itemTotal,
        deliveryFee,
        discount,
        total,
        status,
        items: {
          create: input.items.map((i) => {
            const p = byId.get(i.productId)!;
            const inv = p.inventory!;
            return {
              productId: p.id,
              productName: p.name,
              unit: inv.unit,
              quantityValue: inv.quantityValue,
              price: inv.price ?? 0,
              qty: i.qty,
            };
          }),
        },
        statusEvents: {
          create: {
            status,
            note: isOnline
              ? "Online bill created by admin"
              : "Walk-in bill created by admin",
          },
        },
      },
    });
  });

  revalidatePath("/admin/orders");
  return { orderId: order.id };
}
