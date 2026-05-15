import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function normalizePhone(raw: string): string {
  return raw.trim();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = normalizePhone(searchParams.get("phone") ?? "");
  if (!phone) return Response.json({ customer: null });

  const customer = await prisma.customer.findUnique({
    where: { phone },
    include: {
      addresses: { orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }] },
      _count: { select: { orders: true } },
    },
  });

  if (!customer) return Response.json({ customer: null });

  return Response.json({
    customer: {
      id: customer.id,
      phone: customer.phone,
      name: customer.name,
      email: customer.email,
      address: customer.address,
      addresses: customer.addresses,
      orderCount: customer._count.orders,
      createdAt: customer.createdAt,
    },
  });
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.phone !== "string") {
    return Response.json({ error: "phone required" }, { status: 400 });
  }
  const phone = normalizePhone(body.phone);
  if (!phone) return Response.json({ error: "phone required" }, { status: 400 });

  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  const email = typeof body.email === "string" ? body.email.trim() : undefined;

  const customer = await prisma.customer.upsert({
    where: { phone },
    update: {
      name: name === undefined ? undefined : name || null,
      email: email === undefined ? undefined : email || null,
    },
    create: {
      phone,
      name: name || null,
      email: email || null,
    },
  });

  return Response.json({
    customer: {
      id: customer.id,
      phone: customer.phone,
      name: customer.name,
      email: customer.email,
    },
  });
}
