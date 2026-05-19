import webpush from "web-push";
import { prisma } from "./prisma";

let configured = false;

function configure() {
  if (configured) return true;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@example.com";
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

export async function broadcastToAdmins(payload: PushPayload): Promise<void> {
  if (!configure()) {
    console.warn("[push] VAPID keys not configured — skipping push");
    return;
  }

  const subs = await prisma.adminPushSubscription.findMany();
  if (subs.length === 0) return;

  const body = JSON.stringify(payload);
  const stale: string[] = [];

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          body
        );
      } catch (err: unknown) {
        const status = (err as { statusCode?: number })?.statusCode;
        if (status === 404 || status === 410) {
          stale.push(sub.endpoint);
        } else {
          console.error("[push] send failed", status, err);
        }
      }
    })
  );

  if (stale.length > 0) {
    await prisma.adminPushSubscription
      .deleteMany({ where: { endpoint: { in: stale } } })
      .catch(() => {});
  }
}

export async function sendNewOrderPush(args: {
  orderId: string;
  customerName: string | null;
  total: number;
  itemCount: number;
}): Promise<void> {
  const name = args.customerName?.trim() || "Customer";
  const title = `New order — ₹${args.total.toFixed(0)}`;
  const body = `${name} ordered ${args.itemCount} item${args.itemCount === 1 ? "" : "s"}. Tap to view.`;
  await broadcastToAdmins({
    title,
    body,
    url: `/admin/orders/${args.orderId}`,
    tag: `order-${args.orderId}`,
  });
}
