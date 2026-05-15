import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { styleFor } from "@/lib/category-style";
import { optimizeCld } from "@/lib/cloudinary-optimize";
import AddToCartButton from "@/app/components/products/AddToCartButton";
import BackButton from "./BackButton";

export const revalidate = 60;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { inventory: true, category: true },
  });

  if (!product || !product.inventory) notFound();

  const style = styleFor(product.category.name);
  const isAvailable = product.inventory.isAvailable && product.inventory.stockQty > 0;
  const qtyLabel =
    product.inventory.quantityValue != null
      ? `${product.inventory.quantityValue} ${product.inventory.unit}`
      : product.inventory.unit;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-2">
        <BackButton />
        <h1 className="text-[15px] font-bold text-gray-900 truncate">{product.category.name}</h1>
      </div>

      <div className="bg-white px-6 py-8">
        <div
          className={`w-full aspect-square max-w-xs mx-auto rounded-3xl flex items-center justify-center text-8xl overflow-hidden relative ${
            product.imageUrl ? "bg-gray-50" : style.bg
          }`}
        >
          {product.imageUrl ? (
            <Image
              src={optimizeCld(product.imageUrl, { width: 600 })}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 80vw, 320px"
              className="object-cover"
              priority
            />
          ) : (
            style.emoji
          )}
        </div>
      </div>

      <div className="bg-white mt-2 px-4 py-5 border-t border-gray-100">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-600 mb-1">
          {product.category.name}
        </p>
        <h2 className="text-[20px] font-bold text-gray-900 leading-tight">{product.name}</h2>
        <p className="text-[13px] text-gray-500 mt-1">{qtyLabel}</p>

        <div className="flex items-baseline gap-2 mt-4">
          <span className="text-[24px] font-bold text-gray-900">₹{product.inventory.price ?? 0}</span>
          {!isAvailable && (
            <span className="text-[12px] font-semibold text-red-500">Out of stock</span>
          )}
        </div>
      </div>

      <div className="bg-white mt-2 px-4 py-5 border-t border-gray-100">
        <p className="text-[14px] font-bold text-gray-900 mb-3">Why shop with us</p>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-2xl mb-1">⚡</div>
            <p className="text-[11px] font-semibold text-gray-600 leading-tight">8-min delivery</p>
          </div>
          <div>
            <div className="text-2xl mb-1">✅</div>
            <p className="text-[11px] font-semibold text-gray-600 leading-tight">Best prices</p>
          </div>
          <div>
            <div className="text-2xl mb-1">🔄</div>
            <p className="text-[11px] font-semibold text-gray-600 leading-tight">Easy returns</p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 left-0 right-0 max-w-md mx-auto px-4 z-40">
        <AddToCartButton
          productId={product.id}
          slug={product.slug}
          name={product.name}
          unit={product.inventory.unit}
          quantityValue={product.inventory.quantityValue}
          price={product.inventory.price ?? 0}
          emoji={style.emoji}
          bg={style.bg}
          imageUrl={product.imageUrl}
          isAvailable={isAvailable}
        />
      </div>
    </div>
  );
}
