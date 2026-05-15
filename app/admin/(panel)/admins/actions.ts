"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, makePasswordHash } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";

function normalize(username: string) {
  return username.trim().toLowerCase();
}

export async function createAdmin(formData: FormData) {
  const me = await requireAdmin();
  const username = normalize(String(formData.get("username") ?? ""));
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim() || null;

  if (!/^[a-z0-9_.-]{3,30}$/.test(username)) {
    throw new Error("Username must be 3-30 chars, lowercase letters/numbers/._-");
  }
  if (password.length < 6) throw new Error("Password must be at least 6 characters");

  const existing = await prisma.admin.findUnique({ where: { username } });
  if (existing) throw new Error("Username already taken");

  const created = await prisma.admin.create({
    data: {
      username,
      passwordHash: makePasswordHash(password),
      displayName,
      isActive: true,
    },
  });

  await logAudit(me.id, "create", "admin", created.id, `username=${username}`);
  revalidatePath("/admin/admins");
}

export async function resetAdminPassword(adminId: string, password: string) {
  const me = await requireAdmin();
  if (password.length < 6) throw new Error("Password must be at least 6 characters");
  await prisma.admin.update({
    where: { id: adminId },
    data: { passwordHash: makePasswordHash(password) },
  });
  await logAudit(me.id, "reset_password", "admin", adminId);
  revalidatePath("/admin/admins");
}

export async function toggleAdminActive(adminId: string) {
  const me = await requireAdmin();
  const target = await prisma.admin.findUnique({ where: { id: adminId } });
  if (!target) throw new Error("Admin not found");
  if (target.id === me.id) throw new Error("You can't deactivate yourself");

  const activeCount = await prisma.admin.count({ where: { isActive: true } });
  if (target.isActive && activeCount <= 1) {
    throw new Error("At least one active admin must remain");
  }

  await prisma.admin.update({
    where: { id: adminId },
    data: { isActive: !target.isActive },
  });
  await logAudit(me.id, target.isActive ? "deactivate" : "activate", "admin", adminId);
  revalidatePath("/admin/admins");
}

export async function deleteAdmin(adminId: string) {
  const me = await requireAdmin();
  if (adminId === me.id) throw new Error("You can't delete yourself");
  const activeCount = await prisma.admin.count({ where: { isActive: true } });
  if (activeCount <= 1) throw new Error("At least one active admin must remain");
  await prisma.admin.delete({ where: { id: adminId } });
  await logAudit(me.id, "delete", "admin", adminId);
  revalidatePath("/admin/admins");
}
