import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
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

  const placedAt = o.createdAt.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="bg-white min-h-screen text-gray-900 print:bg-white">
      <div className="max-w-md mx-auto p-6 print:p-2 print:max-w-none text-[13px]">
        <div className="flex items-start justify-between mb-4 print:mb-2">
          <div>
            <h1 className="text-[20px] font-bold">Jeeva Mart</h1>
            <p className="text-[11px] text-gray-500">Order receipt</p>
          </div>
          <PrintTrigger autoPrint={sp.auto === "1"} />
        </div>

        <div className="border-t border-b border-dashed border-gray-300 py-3 mb-3 flex justify-between text-[12px]">
          <div>
            <p className="font-bold">Order #{o.id.slice(0, 8).toUpperCase()}</p>
            <p className="text-gray-500">{placedAt}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold uppercase">{o.status.replace(/_/g, " ")}</p>
          </div>
        </div>

        <div className="mb-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
            Customer
          </p>
          <p className="font-semibold">{o.customerName ?? o.customer.name ?? "Customer"}</p>
          <p>{o.phone}</p>
        </div>

        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
            Deliver to
          </p>
          <p className="leading-snug">{o.address}</p>
        </div>

        <table className="w-full text-[12px] mb-3">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left py-1 font-bold">Item</th>
              <th className="text-center py-1 font-bold w-12">Qty</th>
              <th className="text-right py-1 font-bold w-16">Price</th>
              <th className="text-right py-1 font-bold w-20">Amount</th>
            </tr>
          </thead>
          <tbody>
            {o.items.map((it) => (
              <tr key={it.id} className="border-b border-dashed border-gray-200">
                <td className="py-1.5 align-top">
                  <p className="font-semibold">{it.productName}</p>
                  <p className="text-[10px] text-gray-500">
                    {it.quantityValue != null ? `${it.quantityValue} ${it.unit}` : it.unit}
                  </p>
                </td>
                <td className="py-1.5 text-center align-top">{it.qty}</td>
                <td className="py-1.5 text-right align-top">₹{it.price}</td>
                <td className="py-1.5 text-right align-top font-semibold">
                  ₹{it.price * it.qty}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-gray-300 pt-2 flex flex-col gap-0.5 text-[12px]">
          <Row label="Item total" value={`₹${o.itemTotal}`} />
          <Row
            label="Delivery"
            value={o.deliveryFee === 0 ? "FREE" : `₹${o.deliveryFee}`}
          />
          {o.discount > 0 && <Row label="Discount" value={`− ₹${o.discount}`} />}
          <div className="border-t border-dashed border-gray-300 my-1" />
          <div className="flex justify-between text-[14px] font-bold">
            <span>Total</span>
            <span>₹{o.total}</span>
          </div>
        </div>

        <p className="text-[10px] text-gray-500 text-center mt-4 print:mt-2">
          Pay on Delivery · Thank you for shopping with Jeeva Mart
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}</span>
      <span>{value}</span>
    </div>
  );
}
