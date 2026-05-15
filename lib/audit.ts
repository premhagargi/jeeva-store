import { prisma } from "./prisma";

export async function logAudit(
  adminId: string | null,
  action: string,
  entity: string,
  entityId?: string | null,
  details?: string | null,
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        adminId: adminId ?? null,
        action,
        entity,
        entityId: entityId ?? null,
        details: details ?? null,
      },
    });
  } catch (err) {
    console.error("audit log failed", err);
  }
}
