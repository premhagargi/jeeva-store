interface OrderNotification {
  orderId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  notes: string | null;
  items: Array<{ name: string; qty: number; price: number; unit?: string | null; quantityValue?: number | null }>;
  itemTotal: number;
  deliveryFee: number;
  total: number;
}

function formatMessage(o: OrderNotification): string {
  const lines = [
    `🛒 New Order #${o.orderId.slice(-6).toUpperCase()}`,
    ``,
    `👤 ${o.customerName || "(no name)"}`,
    `📞 ${o.customerPhone}`,
    `📍 ${o.address}`,
  ];
  if (o.notes) lines.push(`📝 ${o.notes}`);
  lines.push(``, `Items:`);
  for (const it of o.items) {
    const qtyLabel = it.quantityValue && it.unit ? ` (${it.quantityValue}${it.unit})` : "";
    lines.push(`• ${it.name}${qtyLabel} x${it.qty} — ₹${it.price * it.qty}`);
  }
  lines.push(
    ``,
    `Subtotal: ₹${o.itemTotal}`,
    `Delivery: ₹${o.deliveryFee}`,
    `Total: ₹${o.total}`,
  );
  return lines.join("\n");
}

export async function sendOrderWhatsApp(order: OrderNotification): Promise<void> {
  const phone = process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;
  if (!phone || !apikey) return;

  const text = formatMessage(order);
  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apikey)}`;

  try {
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) {
      console.error("[whatsapp] CallMeBot returned", res.status, await res.text().catch(() => ""));
    }
  } catch (err) {
    console.error("[whatsapp] failed to send order notification", err);
  }
}
