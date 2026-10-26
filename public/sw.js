self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { /* message vide */ }
  event.waitUntil(self.registration.showNotification(data.title || "ED B-CENTER", {
    body: data.body || "",
    vibrate: [200, 100, 200],
    data: { url: data.url || "./" },
  }));
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
    for (const c of list) { if ("focus" in c) return c.focus(); }
    return self.clients.openWindow((event.notification.data && event.notification.data.url) || "./");
  }));
});
