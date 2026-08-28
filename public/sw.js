const CACHE_PREFIX = "geoquiz-";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);
      if (cached && event.request.mode !== "navigate") return cached;

      try {
        const res = await fetch(event.request);
        if (res.ok) {
          const cache = await caches.open(`${CACHE_PREFIX}runtime`);
          cache.put(event.request, res.clone());
        }
        return res;
      } catch (error) {
        if (cached) return cached;
        if (event.request.mode === "navigate") {
          const base = self.location.pathname.replace(/\/sw\.js$/, "");
          const home = await caches.match(`${base}/`);
          if (home) return home;
        }
        throw error;
      }
    })()
  );
});
