"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import type { OrderStatus } from "@prisma/client";

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string,
) {
  const me = await requireAdmin();
  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { status } }),
    prisma.orderStatusEvent.create({
      data: {
        orderId,
        status,
        adminId: me.id,
        note: note?.trim() || null,
      },
    }),
  ]);
  await logAudit(me.id, "status_change", "order", orderId, status);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/orders");
}

export async function saveOrderAdminNotes(orderId: string, notes: string) {
  const me = await requireAdmin();
  await prisma.order.update({
    where: { id: orderId },
    data: { adminNotes: notes.trim() || null },
  });
  await logAudit(me.id, "update_notes", "order", orderId);
  revalidatePath(`/admin/orders/${orderId}`);
}
