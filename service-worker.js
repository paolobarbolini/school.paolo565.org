const cacheName = "istitutogobettiapp-v1";

const expectedCaches = [
    cacheName,
];

var cacheFiles = [
    "/",
    "/assets/css/app.css",
    "/assets/js/utils.js",
    "/assets/js/pages.js",
    "/assets/js/istitutogobetti.js",
    "/assets/js/app.js",
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheName)
            .then(cache => cache.addAll(cacheFiles))
            .then(self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return cacheNames.filter(cacheName => !expectedCaches.includes(cacheName));
        }).then(cachesToDelete => {
            return Promise.all(cachesToDelete.map(cacheToDelete => {
                return caches.delete(cacheToDelete);
            }));
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).then(response => {
                caches.open(cacheName).then(cache => {
                    cache.put(event.request, response.clone());
                });

                return response;
            });
        })
    );
});