import { fetchAdminOrders } from "./query";
import OrdersPanel from "./OrdersPanel";

export const dynamic = "force-dynamic";

export default async function AdminOrders({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const filter = sp.filter ?? "active";
  const q = (sp.q ?? "").trim();

  const orders = await fetchAdminOrders({ filter, q });

  return (
    <OrdersPanel
      initialOrders={orders}
      initialFilter={filter}
      initialQ={q}
    />
  );
}
