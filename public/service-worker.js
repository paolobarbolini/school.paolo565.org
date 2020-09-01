const commitHash = '{{last_commit_hash}}';
const cacheName = `isg-pwa-v2-${commitHash}`;

const expectedCaches = [
  cacheName,
];

const cacheFiles = [
    '/',
    '/avvisi',
    '/info',
    `/static/app.css?v=${commitHash}`,
    `/static/app.js?v=${commitHash}`,
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

    const url = new URL(request.url);
    if (url.pathname === '/' || url.pathname === '/avvisi'
        || url.pathname.startsWith('/classi/') || url.pathname.startsWith('/docenti/')
        || url.pathname.startsWith('/aule/') || url.pathname.startsWith('/avvisi/')) {
        try {
            const resp = await fetch(request);
            cache.put(request, resp.clone());
            return resp;
        } catch (e) {
            const resp = await cache.match(request);
            if (resp) return resp;

            return await cache.match('/offline');
        }
    }

    const resp = await cache.match(request);
    if (resp) return resp;

    try {
        const resp = await fetch(request);
        return resp;
    } catch (e) {
        return await cache.match('/offline');
    }
}
