// eslint-disable-next-line no-undef
const cacheFiles = ['/'].concat(serviceWorkerOption.assets);

// Cache name generator
const str = cacheFiles.join();

let hash = 0;
for (let i = 0; i < str.length; i++) {
  const chr = str.charCodeAt(i);
  hash = ((hash << 5) - hash) + chr;
  hash |= 0;
}
hash = Math.abs(hash);

const cacheName = `istitutogobettiapp-${hash}`;

const expectedCaches = [
  cacheName,
];

self.addEventListener('install', (event) => {
  self.skipWaiting();

  event.waitUntil(
      caches.open(cacheName)
          .then((cache) => cache.addAll(cacheFiles))
  );
});

self.addEventListener('activate', (event) => {
  self.clients.claim();

  event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
            cacheNames.map((cacheName) => {
              if (!expectedCaches.includes(cacheName)) {
                return caches.delete(cacheName);
              }
            })
        );
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
      caches.match(event.request)
          .then((response) => response || fetch(event.request))
  );
});
