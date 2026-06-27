import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDateTimeIST } from "@/lib/format-date";
import PrintTrigger from "./PrintTrigger";

export default async function OrderPrintPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ auto?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const o = await prisma.order.findUnique({
    where: { id },
    include: { customer: true, items: true },
  });
  if (!o) notFound();

  const placedAt = formatDateTimeIST(o.createdAt);
  const isWalkin = o.address === "Walk-in customer";
  const isPaid = o.status === "DELIVERED";
  const customerName =
    o.customerName ?? o.customer.name ?? (isWalkin ? "Walk-in Customer" : "Customer");

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Controls bar — hidden when printing */}
      <div className="print:hidden sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between gap-3">
        <Link
          href={`/admin/orders/${o.id}`}
          className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-600 active:text-gray-900"
        >
          <ArrowLeft size={15} />
          Back to order
        </Link>
        <div className="flex items-center gap-2">
          <p className="text-[11px] text-gray-400 hidden sm:block">
            Use &ldquo;Save as PDF&rdquo; in the print dialog to download
          </p>
          <PrintTrigger autoPrint={sp.auto === "1"} />
        </div>
      </div>

      {/* Bill */}
      <div className="max-w-sm mx-auto px-6 py-8 print:px-4 print:py-4 print:max-w-none">

        {/* Store header */}
        <div className="text-center mb-5">
          <h1 className="text-[28px] font-black tracking-tight">Jeeva Mart</h1>
          <p className="text-[12px] text-gray-500 mt-0.5">Fresh &amp; Natural Groceries</p>
          {isWalkin ? (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border border-dashed border-emerald-300 bg-emerald-50 text-emerald-700">
              🏪 Walk-in Bill
            </div>
          ) : (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border border-dashed border-blue-300 bg-blue-50 text-blue-700">
              📱 Delivery Order
            </div>
          )}
        </div>

        {/* Bill # and date */}
        <div className="flex justify-between items-start border-t-2 border-b-2 border-dashed border-gray-200 py-3 mb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Bill No.
            </p>
            <p className="text-[18px] font-black text-gray-900 mt-0.5">
              #{o.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Date &amp; Time
            </p>
            <p className="text-[12px] font-semibold text-gray-700 mt-0.5">{placedAt}</p>
          </div>
        </div>

        {/* Customer */}
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
            Customer
          </p>
          <p className="text-[16px] font-bold text-gray-900">{customerName}</p>
          {!isWalkin && (
            <p className="text-[13px] text-gray-600 mt-0.5">{o.phone}</p>
          )}
        </div>

        {/* Address — delivery only */}
        {!isWalkin && (
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
              Deliver to
            </p>
            <p className="text-[13px] text-gray-700 leading-relaxed">{o.address}</p>
          </div>
        )}

        {o.customerNotes && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-0.5">
              Notes
            </p>
            <p className="text-[12px] text-amber-800">{o.customerNotes}</p>
          </div>
        )}

        {/* Items */}
        <table className="w-full text-[13px] mb-4">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-2 font-bold text-gray-600 text-[11px] uppercase tracking-wide">
                Item
              </th>
              <th className="text-center py-2 font-bold text-gray-600 text-[11px] uppercase tracking-wide w-10">
                Qty
              </th>
              <th className="text-right py-2 font-bold text-gray-600 text-[11px] uppercase tracking-wide w-16">
                Rate
              </th>
              <th className="text-right py-2 font-bold text-gray-600 text-[11px] uppercase tracking-wide w-20">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dashed divide-gray-200">
            {o.items.map((it) => (
              <tr key={it.id}>
                <td className="py-2.5 align-top">
                  <p className="font-semibold text-gray-900 leading-snug">{it.productName}</p>
                  <p className="text-[11px] text-gray-400">
                    {it.quantityValue != null
                      ? `${it.quantityValue} ${it.unit}`
                      : it.unit}
                  </p>
                </td>
                <td className="py-2.5 text-center align-top font-semibold">{it.qty}</td>
                <td className="py-2.5 text-right align-top text-gray-600">₹{it.price}</td>
                <td className="py-2.5 text-right align-top font-bold">₹{it.price * it.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="border-t-2 border-gray-200 pt-3 flex flex-col gap-1.5 text-[13px]">
          <div className="flex justify-between text-gray-600">
            <span>Items total</span>
            <span className="font-semibold">₹{o.itemTotal}</span>
          </div>
          {!isWalkin && (
            <div className="flex justify-between text-gray-600">
              <span>Delivery fee</span>
              <span className="font-semibold">
                {o.deliveryFee === 0 ? "FREE" : `₹${o.deliveryFee}`}
              </span>
            </div>
          )}
          {o.discount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Discount</span>
              <span className="font-semibold">− ₹{o.discount}</span>
            </div>
          )}
          <div className="border-t-2 border-dashed border-gray-200 mt-1 pt-2 flex justify-between items-center">
            <span className="text-[16px] font-black text-gray-900">TOTAL</span>
            <span className="text-[22px] font-black text-gray-900">₹{o.total}</span>
          </div>
        </div>

        {/* Payment status */}
        {isPaid ? (
          <div className="mt-5 border-2 border-emerald-400 rounded-xl p-4 text-center">
            <p className="text-[20px] font-black text-emerald-600">✓ PAID</p>
            <p className="text-[11px] text-emerald-600 mt-0.5">
              {isWalkin ? "Received at counter" : "Payment received"}
            </p>
          </div>
        ) : (
          <div className="mt-5 border border-dashed border-gray-300 rounded-xl p-3 text-center">
            <p className="text-[13px] font-semibold text-gray-600">
              Payment: Cash / UPI on Delivery
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center space-y-0.5">
          <p className="text-[12px] font-semibold text-gray-500">
            Thank you for shopping with Jeeva Mart! 🌿
          </p>
          <p className="text-[10px] text-gray-400">
            Freshness guaranteed · Natural &amp; Quality products
          </p>
        </div>

      </div>
    </div>
  );
}
