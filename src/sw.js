// Blendwise service worker: precache the whole app so it runs fully offline.
// Bump CACHE_VERSION on every release (scripts/bump-version.mjs does this).

const CACHE_VERSION = 'blendwise-v1.0.0';
const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/app.css',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './js/app.js',
  './js/config.js',
  './js/crypto.js',
  './js/dom.js',
  './js/estimator.js',
  './js/face.js',
  './js/pwa.js',
  './js/router.js',
  './js/store.js',
  './js/telemetry.js',
  './js/views/admin.js',
  './js/views/beforeafter.js',
  './js/views/estimate.js',
  './js/views/feedback.js',
  './js/views/home.js',
  './js/views/insights.js',
  './js/views/kit.js',
  './js/views/legal.js',
  './js/views/look.js',
  './js/views/looks.js',
  './js/views/more.js',
  './js/views/play.js',
  './js/views/products.js',
  './js/views/settings.js',
  './js/views/share.js',
  './js/views/tips.js',
  './data/legal.js',
  './data/looks.js',
  './data/products.js',
  './data/steps.js',
  './data/tips.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // never cache or intercept third-party requests

  // Navigations: serve the app shell from cache, fall back to network.
  if (req.mode === 'navigate') {
    event.respondWith(caches.match('./index.html').then((cached) => cached || fetch(req)));
    return;
  }

  // Same-origin assets: stale-while-revalidate. The cached copy is served immediately (so the app
  // is instant and works offline); a background fetch refreshes the cache for the next load.
  event.respondWith(
    caches.open(CACHE_VERSION).then(async (cache) => {
      const cached = await cache.match(req, { ignoreSearch: true });
      const refresh = fetch(req)
        .then((res) => {
          if (res && res.ok && res.type === 'basic') cache.put(req, res.clone());
          return res;
        })
        .catch(() => null);
      if (cached) {
        event.waitUntil(refresh);
        return cached;
      }
      const fresh = await refresh;
      return fresh || new Response('Offline and not cached', { status: 503, headers: { 'Content-Type': 'text/plain' } });
    }),
  );
});
