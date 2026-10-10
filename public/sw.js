// iGROW WORKS Service Worker - Production PWA Offline & Cache Engine
const CACHE_NAME = "igrow-works-v1";
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/qa.html",
  "/404.html",
  "/favicon.svg",
  "/site.webmanifest",
  "/nomair.jpg",
  "/marie.jpg",
  "/golden_ratio.jpg"
];

// Install Event - Pre-cache critical application shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("[SW] Pre-caching warning:", err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up stale caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Hybrid Caching Strategy
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Ignore non-GET or cross-origin external API requests
  if (req.method !== "GET" || (url.origin !== self.location.origin && !url.hostname.includes("fonts.gstatic.com"))) {
    return;
  }

  // Navigation requests (HTML pages): Network-first with Cache fallback
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(req).then((cached) => {
            return cached || caches.match("/index.html");
          });
        })
    );
    return;
  }

  // Static Assets (Images, Icons, Fonts, Scripts, Styles): Cache-first with Network fallback
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(req).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, responseClone));
        }
        return networkResponse;
      });
    })
  );
});
