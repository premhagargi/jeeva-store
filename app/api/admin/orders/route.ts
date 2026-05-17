import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { fetchAdminOrders } from "@/app/admin/(panel)/orders/query";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") ?? "active";
  const q = (searchParams.get("q") ?? "").trim();

  const orders = await fetchAdminOrders({ filter, q });
  return NextResponse.json({ orders });
}
