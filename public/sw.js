// Kill-switch worker: removes any previously installed ad/app service worker.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(
    (async () => {
      try {
        const names = await caches.keys();
        await Promise.allSettled(names.filter((n) => n.startsWith("caakus-")).map((n) => caches.delete(n)));
        await self.clients.claim();
      } finally {
        await self.registration.unregister();
      }
    })(),
  ),
);
