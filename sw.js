/* LanguageDeck service worker — network-first so updates apply immediately when online. */
const CACHE_VERSION = "languagedeck-v13";
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
  if (url.origin !== self.location.origin) return; // ignore cross-origin

  // Network-first: try the network, fall back to cache when offline.
  // This means online users ALWAYS see the latest deployed code, while offline
  // users still get the cached copy.
  event.respondWith(
    fetch(req).then(resp => {
      if (resp.ok) {
        const path = url.pathname.split("/").pop();
        if (APP_SHELL.some(p => p.endsWith(path)) || url.pathname.includes("/decks/") || url.pathname.endsWith("/")) {
          const copy = resp.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(req, copy));
        }
      }
      return resp;
    }).catch(() => caches.match(req))
  );
});
