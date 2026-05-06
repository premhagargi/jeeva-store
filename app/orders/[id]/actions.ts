"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function cancelOrder(orderId: string, phone: string) {
  const trimmedPhone = phone.trim();
  if (!trimmedPhone) throw new Error("Phone required");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) throw new Error("Order not found");
  if (order.phone !== trimmedPhone) throw new Error("This order belongs to a different number");
  if (order.status !== "PROCESSING") {
    throw new Error("This order can no longer be cancelled");
  }

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      await tx.inventory.updateMany({
        where: { productId: item.productId },
        data: { stockQty: { increment: item.qty } },
      });
    }
    await tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });
  });

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
  revalidatePath("/admin/orders");
}
