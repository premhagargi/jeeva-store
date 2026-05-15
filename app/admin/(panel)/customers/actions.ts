"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";

export async function saveCustomer(
  id: string,
  data: { name?: string; address?: string; notes?: string; flagged?: boolean },
) {
  const me = await requireAdmin();
  await prisma.customer.update({
    where: { id },
    data: {
      name: data.name?.trim() || null,
      address: data.address?.trim() || null,
      notes: data.notes?.trim() || null,
      flagged: data.flagged ?? false,
    },
  });
  await logAudit(me.id, "update", "customer", id);
  revalidatePath(`/admin/customers/${id}`);
  revalidatePath("/admin/customers");
}
