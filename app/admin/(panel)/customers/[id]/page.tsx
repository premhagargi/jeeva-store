import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDateTimeIST } from "@/lib/format-date";
import CustomerEditor from "./CustomerEditor";

export default async function CustomerDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: { items: true },
      },
    },
  });
  if (!customer) notFound();

  const totalSpend = customer.orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((s, o) => s + o.total, 0);

  return (
    <div className="px-4 py-4 flex flex-col gap-4">
      <Link href="/admin/customers" className="text-[12px] font-semibold text-emerald-600">
        ← All customers
      </Link>

      <CustomerEditor
        customer={{
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
          notes: customer.notes,
          flagged: customer.flagged,
        }}
      />

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white border border-gray-100 rounded-2xl p-3">
          <p className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">Orders</p>
          <p className="text-[20px] font-bold text-gray-900 mt-0.5">{customer.orders.length}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-3">
          <p className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">Lifetime</p>
          <p className="text-[20px] font-bold text-gray-900 mt-0.5">₹{totalSpend}</p>
        </div>
      </div>

      <h3 className="text-[14px] font-bold text-gray-900 mt-2">Order history</h3>
      <div className="flex flex-col gap-2">
        {customer.orders.length === 0 ? (
          <p className="text-[13px] text-gray-400 text-center py-8">No orders yet.</p>
        ) : (
          customer.orders.map((o) => (
            <Link
              key={o.id}
              href={`/admin/orders?q=${o.id.slice(0, 8)}`}
              className="bg-white border border-gray-100 rounded-xl p-3 active:bg-gray-50 flex items-center justify-between"
            >
              <div>
                <p className="text-[13px] font-bold text-gray-900">
                  #{o.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-[11px] text-gray-500">
                  {formatDateTimeIST(o.createdAt)} · {o.items.length} item{o.items.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[13px] font-bold text-gray-900">₹{o.total}</p>
                <p className="text-[10px] text-gray-400">{o.status}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
