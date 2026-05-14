import { getProductBySlug } from "@/lib/product-service";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const product = await getProductBySlug(slug);
    return Response.json({ product });
  } catch {
    return Response.json({ product: null }, { status: 404 });
  }
}
