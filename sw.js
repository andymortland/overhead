const CACHE = 'overhead-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/airlines.json',
  '/icon-192.svg',
  '/icon-512.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Network-first for the OpenSky API (live data), cache-first for app shell
  if (e.request.url.includes('opensky-network.org')) {
    e.respondWith(fetch(e.request).catch(() => new Response('{"states":null}', { headers: { 'Content-Type': 'application/json' }})));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
