import { getOrderById } from "@/lib/order-service";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const order = await getOrderById(id);
    return Response.json({ order });
  } catch {
    return Response.json({ order: null }, { status: 404 });
  }
}
