const cacheName = 'istitutogobettiapp-v5';

const expectedCaches = [
  cacheName,
];

// eslint-disable-next-line no-undef
const cacheFiles = ['/'].concat(serviceWorkerOption.assets);

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
