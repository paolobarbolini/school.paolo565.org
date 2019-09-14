const cacheName = `isg-pwa-v2-{{last_commit_hash}}`;

const expectedCaches = [
  cacheName,
];

const cacheFiles = [
    // TODO: Add index and articles once those are able to refresh with new additions
    // '/',
    // '/avvisi',
    '/info',
    '/static/app.css',
    '/static/app.js',
    '/static/vendored/pdf-js/pdf.js',
    '/static/vendored/pdf-js/pdf.worker.js',
    '/favicon.ico',
    '/offline',
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

    try {
        const resp = await fetch(request);
        return resp;
    } catch (e) {
        return await cache.match('/offline');
    }
}
