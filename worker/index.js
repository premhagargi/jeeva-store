// Custom service worker code — bundled into public/sw.js by next-pwa.
// Handles Web Push for admin order notifications.

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (_) {
    payload = { title: "Jeeva Mart", body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "New order";
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/icon-192.png",
    badge: payload.badge || "/badge-96.png",
    tag: payload.tag || "jeeva-order",
    renotify: true,
    requireInteraction: true,
    data: { url: payload.url || "/admin/orders" },
    vibrate: [200, 100, 200],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/admin/orders";

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of allClients) {
        try {
          const url = new URL(client.url);
          if (url.pathname.startsWith("/admin")) {
            await client.focus();
            if ("navigate" in client) {
              return client.navigate(target);
            }
            return;
          }
        } catch (_) {}
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(target);
      }
    })()
  );
});
