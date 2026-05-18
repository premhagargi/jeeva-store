import Link from "next/link";
import { notFound } from "next/navigation";
import { Printer, MessageCircle, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDateTimeIST } from "@/lib/format-date";
import AdminNotes from "./AdminNotes";

export default async function OrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const o = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      items: true,
      statusEvents: {
        orderBy: { createdAt: "asc" },
        include: { admin: { select: { username: true, displayName: true } } },
      },
    },
  });
  if (!o) notFound();

  return (
    <div className="px-4 py-4 flex flex-col gap-4">
      <Link href="/admin/orders" className="flex items-center gap-1 text-[12px] font-semibold text-emerald-600">
        <ArrowLeft size={12} />
        All orders
      </Link>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[16px] font-bold text-gray-900">
              #{o.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-[11px] text-gray-400">
              {formatDateTimeIST(o.createdAt)}
            </p>
          </div>
          <div className="flex gap-1.5">
            <a
              href={`/admin/orders/${o.id}/print`}
              target="_blank"
              rel="noopener"
              className="text-[11px] font-bold flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-700"
            >
              <Printer size={12} />
              Print
            </a>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-[12px]">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Customer</p>
            <p className="font-semibold text-gray-900">{o.customerName ?? o.customer.name ?? "—"}</p>
            <p className="text-emerald-600 font-semibold">{o.phone}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Status</p>
            <p className="font-bold text-gray-900">{o.status.replace(/_/g, " ")}</p>
            <p className="text-gray-500">₹{o.total}</p>
          </div>
        </div>
        <div className="mt-3">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Address</p>
          <p className="text-[12px] text-gray-700 mt-0.5">{o.address}</p>
        </div>
      </div>

      {o.customerNotes && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3">
          <p className="text-[10px] uppercase tracking-widest text-amber-700 font-bold">
            Customer notes
          </p>
          <p className="text-[13px] text-amber-900 mt-1">{o.customerNotes}</p>
        </div>
      )}

      <AdminNotes orderId={o.id} initial={o.adminNotes ?? ""} />

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
        <p className="text-[14px] font-bold text-gray-900 mb-2">Items</p>
        <div className="flex flex-col divide-y divide-gray-100">
          {o.items.map((it) => (
            <div key={it.id} className="flex justify-between py-2 text-[13px]">
              <div>
                <p className="font-semibold text-gray-900">{it.productName}</p>
                <p className="text-[11px] text-gray-500">
                  {it.quantityValue != null ? `${it.quantityValue} ${it.unit}` : it.unit} · ₹{it.price} × {it.qty}
                </p>
              </div>
              <p className="font-bold text-gray-900">₹{it.price * it.qty}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-1 text-[12px]">
          <Row label="Item total" value={`₹${o.itemTotal}`} />
          <Row
            label="Delivery"
            value={o.deliveryFee === 0 ? "FREE" : `₹${o.deliveryFee}`}
          />
          {o.discount > 0 && <Row label="Discount" value={`− ₹${o.discount}`} />}
          <div className="flex justify-between text-[14px] font-bold mt-1">
            <span>Total</span>
            <span>₹{o.total}</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
        <p className="text-[14px] font-bold text-gray-900 mb-2">Status history</p>
        <div className="flex flex-col gap-2">
          {o.statusEvents.length === 0 ? (
            <p className="text-[12px] text-gray-400">No status changes recorded.</p>
          ) : (
            o.statusEvents.map((ev) => (
              <div key={ev.id} className="flex items-start gap-2 text-[12px]">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {ev.status.replace(/_/g, " ")}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {formatDateTimeIST(ev.createdAt)}
                    {ev.admin && ` · ${ev.admin.displayName ?? ev.admin.username}`}
                  </p>
                  {ev.note && <p className="text-[11px] text-gray-600 mt-0.5">{ev.note}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-gray-600">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
