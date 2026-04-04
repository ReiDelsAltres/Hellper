/**
 * Purper Service Worker
 * Serves cached files (cached by CacheManager/Modules) and falls back to network.
 * Does NOT cache any files itself.
 *
 * Message API (postMessage from client):
 *   SKIP_WAITING             — activate new SW immediately
 *   GET_VERSION              — return SW version string
 *   IS_ONLINE        { url } — connectivity check from SW context
 *   ENABLE_FETCH_TRACKING    — turn on fetch activity broadcasts
 *   DISABLE_FETCH_TRACKING   — turn off fetch activity broadcasts
 */

const SW_VERSION = '2.0.0';

let fetchCounter = 0;
let fetchTrackingEnabled = false;

function broadcastToClients(message) {
    self.clients.matchAll().then((clients) => {
        clients.forEach((c) => c.postMessage(message));
    });
}

// ── Install ─────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
    console.log(`[ServiceWorker ${SW_VERSION}]: Installing...`);
    self.skipWaiting();
});

// ── Activate ────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
    console.log(`[ServiceWorker ${SW_VERSION}]: Activating...`);
    event.waitUntil(self.clients.claim());
});

// ── Fetch ───────────────────────────────────────────────────────────
// Cache-first for all requests. Never writes to cache.
self.addEventListener("fetch", (event) => {
    const request = event.request;

    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                console.log(`[SW]: Cache hit: ${request.url}`);
                return cachedResponse;
            }
            return fetch(request);
        })
    );
});

// ── Message handling ────────────────────────────────────────────────
self.addEventListener('message', (event) => {
    const { type, url } = event.data || {};
    const port = event.ports?.[0];

    switch (type) {
        case 'SKIP_WAITING':
            console.log('[ServiceWorker]: Skip waiting requested');
            self.skipWaiting();
            break;

        case 'GET_VERSION':
            if (port) port.postMessage({ version: SW_VERSION });
            break;

        case 'IS_ONLINE': {
            fetch(url || '/index.html', { cache: 'no-store', method: 'HEAD' })
                .then((res) => {
                    if (port) port.postMessage({ online: res.ok });
                })
                .catch(() => {
                    if (port) port.postMessage({ online: false });
                });
            break;
        }

        case 'ENABLE_FETCH_TRACKING':
            fetchTrackingEnabled = true;
            console.log('[ServiceWorker]: Fetch tracking enabled');
            break;

        case 'DISABLE_FETCH_TRACKING':
            fetchTrackingEnabled = false;
            console.log('[ServiceWorker]: Fetch tracking disabled');
            break;

        default:
            console.warn(`[ServiceWorker]: Unknown message type "${type}"`);
    }
});