/* LanguageDeck service worker — cache-first for the app shell so it works offline. */
const CACHE_VERSION = "languagedeck-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // don't intercept cross-origin (CSV from external URL etc.)

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(resp => {
        // Cache successful responses for known shell + decks for offline use
        if (resp.ok && (APP_SHELL.includes(url.pathname.split("/").pop()) || url.pathname.includes("/decks/"))) {
          const copy = resp.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(req, copy));
        }
        return resp;
      }).catch(() => cached);
    })
  );
});
