/* LanguageDeck service worker — network-first, update-friendly. */
const CACHE_VERSION = "languagedeck-v75-help-overlay-quota-fixes-20260717";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png"
];

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

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
  if (url.origin !== self.location.origin) return;

  // Network-first: online users get the latest deployed files; offline users get cache.
  // "no-cache" (revalidate) rather than "reload" (force full download): the
  // browser sends If-None-Match/If-Modified-Since, so unchanged files come back
  // as an empty 304 instead of re-downloading the ~320KB index.html and every
  // deck CSV on each launch. Freshness is identical — the server still decides.
  event.respondWith(
    fetch(req, { cache: "no-cache" }).then(resp => {
      if (resp.ok) {
        const path = url.pathname.split("/").pop();
        if (
          APP_SHELL.some(p => p.endsWith(path)) ||
          url.pathname.includes("/decks/") ||
          url.pathname.endsWith("/")
        ) {
          const copy = resp.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(req, copy));
        }
      }
      return resp;
    }).catch(() => caches.match(req))
  );
});
