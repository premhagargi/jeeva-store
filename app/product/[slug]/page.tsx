"use client";

import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useState, use, useEffect } from "react";
import { styleFor } from "@/lib/category-style";
import { optimizeCld } from "@/lib/cloudinary-optimize";
import AddToCartButton from "@/app/components/products/AddToCartButton";
import { getProductBySlug } from "@/lib/product-service";

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);

  const { slug } = use(params);

  useEffect(() => {
    async function load() {
      try {
        const p = await getProductBySlug(slug);
        setProduct(p);
      } catch {
        notFound();
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-gray-50 pb-32 animate-pulse">
        {/* Nav shimmer */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gray-200" />
          <div className="flex-1 min-w-0">
            <div className="h-3 bg-gray-100 rounded w-24 mb-1" />
            <div className="h-3 bg-gray-100 rounded w-16" />
          </div>
        </div>

        {/* Image shimmer */}
        <div className="bg-white px-6 py-8 flex items-center justify-center">
          <div className="w-full aspect-square max-w-xs rounded-3xl bg-gray-200" />
        </div>

        {/* Details shimmer */}
        <div className="bg-white mt-2 px-4 py-5 border-t border-gray-100 space-y-3">
          <div className="h-3 bg-gray-100 rounded w-24" />
          <div className="h-5 bg-gray-100 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/4" />
          <div className="h-6 bg-gray-100 rounded w-1/3 mt-4" />
        </div>

        {/* Features shimmer */}
        <div className="bg-white mt-2 px-4 py-5 border-t border-gray-100">
          <div className="h-4 bg-gray-100 rounded w-36 mb-3" />
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl mb-1 w-full h-7 bg-gray-200 rounded" />
                <div className="h-3 bg-gray-100 rounded w-20 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const style = styleFor(product.category.name);
  const isAvailable = product.inventory?.isAvailable && product.inventory?.stockQty > 0;
  const qtyLabel = product.inventory?.quantityValue != null
    ? `${product.inventory.quantityValue} ${product.inventory.unit}`
    : product.inventory?.unit;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-2">
        <button
          onClick={() => history.back()}
          className="w-9 h-9 rounded-xl flex items-center justify-center active:bg-gray-100"
        >
          <ChevronLeft size={20} className="text-gray-700" />
        </button>
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
          <span className="text-[24px] font-bold text-gray-900">₹{product.inventory?.price ?? 0}</span>
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

      <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto px-4 z-40">
        <AddToCartButton
          productId={product.id}
          slug={product.slug}
          name={product.name}
          unit={product.inventory?.unit}
          quantityValue={product.inventory?.quantityValue}
          price={product.inventory?.price ?? 0}
          emoji={style.emoji}
          bg={style.bg}
          imageUrl={product.imageUrl}
          isAvailable={isAvailable}
        />
      </div>
    </div>
  );
}