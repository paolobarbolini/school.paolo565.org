/*
school.paolo565.org
Copyright (C) 2018-2020 Paolo Barbolini

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

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
