import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getStorefrontSettings } from "@/lib/settings";
import BillForm from "./BillForm";

export default async function NewBillPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const initialType = type === "online" ? "online" : "walkin";

  const [products, settings] = await Promise.all([
    prisma.product.findMany({
      where: { inventory: { isNot: null } },
      include: { inventory: true, category: true },
      orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
    }),
    getStorefrontSettings(),
  ]);

  const productOptions = products
    .filter((p) => p.inventory?.price != null)
    .map((p) => ({
      id: p.id,
      name: p.name,
      price: p.inventory!.price!,
      stockQty: p.inventory!.stockQty,
      unit: p.inventory!.unit,
      quantityValue: p.inventory!.quantityValue,
      categoryEmoji: p.category.emoji,
      categoryName: p.category.name,
      isAvailable: p.inventory!.isAvailable,
    }));

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <Link
          href="/admin"
          className="w-9 h-9 rounded-xl flex items-center justify-center active:bg-gray-100"
        >
          <ChevronLeft size={20} className="text-gray-700" />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold text-gray-900">Create Bill</p>
          <p className="text-[11px] text-gray-400">Walk-in or online customer</p>
        </div>
      </div>

      <BillForm
        products={productOptions}
        initialType={initialType}
        deliveryFee={settings.deliveryFee}
        freeDeliveryThreshold={settings.freeDeliveryThreshold}
      />
    </div>
  );
}
