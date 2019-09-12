const cacheName = `isg-pwa-v2`;

const expectedCaches = [
  cacheName,
];

const cacheFiles = [
    '/favicon.ico'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();

    event.waitUntil(handleInstall());
});

self.addEventListener('activate', (event) => {
    event.waitUntil(handleActivate());
});

self.addEventListener('fetch', (event) => {
    event.respondWith(handleFetch(event.request));
});

const handleInstall = async () => {
    const cache = await caches.open(cacheName);
    await cache.addAll(cacheFiles);
}

const handleActivate = async () => {
    const cacheNames = await caches.keys();
    for(const cacheName of cacheNames) {
        if (!expectedCaches.includes(cacheName)) {
            await caches.delete(cacheName);
        }
    }

    await self.clients.claim();
};

const handleFetch = async (request) => {
    const cache = await caches.open(cacheName);
    const resp = await cache.match(request);
    if (resp) return resp;

    return await fetch(request);
}
