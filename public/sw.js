/* DormMate — minimal SW: cache same-origin `/_next/static/` GET only.
 * Does NOT cache navigations, /api/*, /auth/*, or dashboard HTML.
 */
const STATIC_CACHE = "dormmate-next-static-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  // Never intercept document navigations (dashboard, login, marketing pages).
  if (req.mode === "navigate") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/api/")) return;
  if (url.pathname.startsWith("/auth")) return;

  // Only hashed Next.js build assets (safe to cache long-term).
  if (!url.pathname.startsWith("/_next/static/")) return;

  event.respondWith(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res.ok && res.type === "basic") {
            cache.put(req, res.clone());
          }
          return res;
        });
      }),
    ),
  );
});
