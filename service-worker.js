const cacheName = "istitutogobettiapp-v3";

const expectedCaches = [
    cacheName,
];

const cacheFiles = [
    "/",
    "/assets/css/app.css",
    "/assets/js/utils.js",
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
    const requestUrl = new URL(event.request.url);

    if (requestUrl.origin !== location.origin) {
        event.respondWith(fetch(event.request));
        return;
    }

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