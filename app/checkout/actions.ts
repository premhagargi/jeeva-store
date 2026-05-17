"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStorefrontSettings } from "@/lib/settings";

interface PlaceOrderInput {
  phone: string;
  name: string;
  address: string;
  addressId?: string | null;
  notes?: string;
  items: Array<{ productId: string; price: number; qty: number }>;
}

export async function placeOrder(input: PlaceOrderInput) {
  const phone = input.phone.trim();
  const name = input.name.trim();
  const address = input.address.trim();
  const notes = input.notes?.trim() || null;

  if (!phone || phone.length < 7) throw new Error("Valid phone required");
  if (!address) throw new Error("Address required");
  if (input.items.length === 0) throw new Error("Cart is empty");

  const settings = await getStorefrontSettings();
  if (!settings.storeOpen) {
    throw new Error("Store is currently closed. Please try again later.");
  }

  const productIds = input.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { inventory: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  for (const line of input.items) {
    const p = byId.get(line.productId);
    if (!p || !p.inventory) throw new Error(`Product not available`);
  }

  const itemTotal = input.items.reduce((s, i) => {
    const p = byId.get(i.productId)!;
    return s + (p.inventory!.price ?? 0) * i.qty;
  }, 0);

  if (settings.minOrderValue > 0 && itemTotal < settings.minOrderValue) {
    throw new Error(`Minimum order value is ₹${settings.minOrderValue}`);
  }

  const deliveryFee =
    settings.freeDeliveryThreshold > 0 && itemTotal >= settings.freeDeliveryThreshold
      ? 0
      : settings.deliveryFee;
  const total = itemTotal + deliveryFee;

  const customer = await prisma.customer.upsert({
    where: { phone },
    update: { name: name || undefined, address },
    create: { phone, name: name || undefined, address },
  });

  const order = await prisma.$transaction(async (tx) => {
    if (input.addressId) {
      await tx.address.updateMany({
        where: { id: input.addressId, customerId: customer.id },
        data: { phone },
      });
    }

    for (const line of input.items) {
      const p = byId.get(line.productId)!;
      const result = await tx.inventory.updateMany({
        where: {
          productId: line.productId,
          isAvailable: true,
          stockQty: { gte: line.qty },
        },
        data: { stockQty: { decrement: line.qty } },
      });
      if (result.count === 0) {
        throw new Error(`Out of stock: ${p.name}`);
      }
    }

    const created = await tx.order.create({
      data: {
        customerId: customer.id,
        phone,
        address,
        customerNotes: notes,
        itemTotal,
        deliveryFee,
        discount: 0,
        total,
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
          create: { status: "PROCESSING", note: "Order placed" },
        },
      },
    });

    return created;
  });

  redirect(`/orders/${order.id}?placed=1`);
}
