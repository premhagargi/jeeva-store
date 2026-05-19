import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
    userAgent?: string;
  } | null;

  if (!body?.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return Response.json({ error: "Invalid subscription" }, { status: 400 });
  }

  await prisma.adminPushSubscription.upsert({
    where: { endpoint: body.endpoint },
    create: {
      adminId: session.id,
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
      userAgent: body.userAgent ?? null,
    },
    update: {
      adminId: session.id,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
      userAgent: body.userAgent ?? null,
    },
  });

  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as {
    endpoint?: string;
  } | null;

  if (!body?.endpoint) {
    return Response.json({ error: "Endpoint required" }, { status: 400 });
  }

  await prisma.adminPushSubscription.deleteMany({
    where: { endpoint: body.endpoint, adminId: session.id },
  });

  return Response.json({ ok: true });
}
