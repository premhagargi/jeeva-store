import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function normalizePhone(raw: string): string {
  return raw.trim();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = normalizePhone(searchParams.get("phone") ?? "");
  if (!phone) return Response.json({ addresses: [] });

  const addresses = await prisma.address.findMany({
    where: { phone },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });
  return Response.json({ addresses });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.phone !== "string") {
    return Response.json({ error: "phone required" }, { status: 400 });
  }
  const phone = normalizePhone(body.phone);
  const line1 = typeof body.line1 === "string" ? body.line1.trim() : "";
  if (!phone || !line1) {
    return Response.json({ error: "phone and line1 required" }, { status: 400 });
  }

  const customer = await prisma.customer.upsert({
    where: { phone },
    update: {},
    create: { phone },
  });

  const isDefault = Boolean(body.isDefault);

  const created = await prisma.$transaction(async (tx) => {
    if (isDefault) {
      await tx.address.updateMany({
        where: { customerId: customer.id },
        data: { isDefault: false },
      });
    }
    const existingCount = await tx.address.count({
      where: { customerId: customer.id },
    });
    return tx.address.create({
      data: {
        customerId: customer.id,
        phone,
        label: body.label?.trim() || null,
        fullName: body.fullName?.trim() || null,
        line1,
        line2: body.line2?.trim() || null,
        landmark: body.landmark?.trim() || null,
        city: body.city?.trim() || null,
        state: body.state?.trim() || null,
        pincode: body.pincode?.trim() || null,
        isDefault: isDefault || existingCount === 0,
      },
    });
  });

  return Response.json({ address: created });
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.id !== "string") {
    return Response.json({ error: "id required" }, { status: 400 });
  }
  const id = body.id;

  const existing = await prisma.address.findUnique({ where: { id } });
  if (!existing) return Response.json({ error: "not found" }, { status: 404 });

  const isDefault = body.isDefault === undefined ? undefined : Boolean(body.isDefault);

  const updated = await prisma.$transaction(async (tx) => {
    if (isDefault === true) {
      await tx.address.updateMany({
        where: { customerId: existing.customerId, NOT: { id } },
        data: { isDefault: false },
      });
    }
    return tx.address.update({
      where: { id },
      data: {
        label: body.label === undefined ? undefined : body.label?.trim() || null,
        fullName: body.fullName === undefined ? undefined : body.fullName?.trim() || null,
        line1: body.line1 === undefined ? undefined : body.line1.trim(),
        line2: body.line2 === undefined ? undefined : body.line2?.trim() || null,
        landmark: body.landmark === undefined ? undefined : body.landmark?.trim() || null,
        city: body.city === undefined ? undefined : body.city?.trim() || null,
        state: body.state === undefined ? undefined : body.state?.trim() || null,
        pincode: body.pincode === undefined ? undefined : body.pincode?.trim() || null,
        isDefault,
      },
    });
  });

  return Response.json({ address: updated });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "id required" }, { status: 400 });

  const existing = await prisma.address.findUnique({ where: { id } });
  if (!existing) return Response.json({ ok: true });

  await prisma.$transaction(async (tx) => {
    await tx.address.delete({ where: { id } });
    if (existing.isDefault) {
      const next = await tx.address.findFirst({
        where: { customerId: existing.customerId },
        orderBy: { updatedAt: "desc" },
      });
      if (next) {
        await tx.address.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    }
  });

  return Response.json({ ok: true });
}
