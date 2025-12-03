// Service Worker - sw.js
const CACHE_NAME = 'pwa-cache-v1';
const RUNTIME_CACHE = 'pwa-runtime-cache-v1';

const URLS_TO_CACHE = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json',
];

// -----------------------------
//  INSTALL
// -----------------------------
self.addEventListener('install', event => {
    console.log('📦 Service Worker instalándose...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Archivos en caché');
                return cache.addAll(URLS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// -----------------------------
//  ACTIVATE
// -----------------------------
self.addEventListener('activate', event => {
    console.log('🚀 Service Worker activado');

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                        console.log('🗑️ Eliminando caché antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// -----------------------------
//  FETCH
// -----------------------------
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);

    // ❗ Evitar error de chrome-extension://, data:, blob:, file:, etc.
    if (!url.protocol.startsWith('http')) {
        return; // No interceptar ni cachear
    }

    // No procesar métodos distintos de GET
    if (request.method !== 'GET') {
        return;
    }

    // API externa con estrategia Network First
    if (request.url.includes('jsonplaceholder.typicode.com')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(RUNTIME_CACHE).then(cache => {
                            cache.put(request, clone);
                        });
                    }
                    return response;
                })
                .catch(() => caches.match(request).then(res => res || createOfflineResponse()))
        );
        return;
    }

    // Estrategia Cache First para archivos locales
    event.respondWith(
        caches.match(request).then(cachedResponse => {
            if (cachedResponse) return cachedResponse;

            return fetch(request)
                .then(response => {
                    if (!response || response.status !== 200) {
                        return response;
                    }

                    const responseClone = response.clone();
                    caches.open(RUNTIME_CACHE).then(cache => {
                        cache.put(request, responseClone);
                    });

                    return response;
                })
                .catch(() => createOfflineResponse());
        })
    );
});

// -----------------------------
//  MODO OFFLINE
// -----------------------------
function createOfflineResponse() {
    return new Response(
        '<h1>Modo Offline</h1><p>No tienes conexión a internet.</p>',
        {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=UTF-8' }
        }
    );
}

// -----------------------------
//  BACKGROUND SYNC
// -----------------------------
self.addEventListener('sync', event => {
    if (event.tag === 'sync-posts') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=10');
        const data = await response.json();
        const cache = await caches.open(RUNTIME_CACHE);

        await cache.put(
            'https://jsonplaceholder.typicode.com/posts?_limit=10',
            new Response(JSON.stringify(data))
        );

    } catch (error) {
        console.error('❌ Error en sincronización:', error);
    }
}

// -----------------------------
//  PUSH NOTIFICATIONS
// -----------------------------
self.addEventListener('push', event => {
    let payload = { title: 'Notificación', body: 'Tienes una nueva notificación.' };

    try {
        if (event.data) {
            payload = event.data.json();
        }
    } catch (e) {
        console.error('Error parseando payload push:', e);
    }

    const title = payload.title || 'Mi PWA';
    const options = {
        body: payload.body || '',
        icon: payload.icon || '/assets/image.png',
        badge: payload.badge || '/assets/image.png',
        data: payload.data || {},
        tag: payload.tag
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// -----------------------------
//  CLICK EN NOTIFICACIÓN
// -----------------------------
self.addEventListener('notificationclick', event => {
    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(windowClients => {
                for (const client of windowClients) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// -----------------------------
//  CAMBIO DE SUSCRIPCIÓN
// -----------------------------
self.addEventListener('pushsubscriptionchange', event => {
    console.log('🔄 pushsubscriptionchange detectado:', event);

    event.waitUntil((async () => {
        try {
            // Aquí podrías volver a suscribir al usuario y enviarlo al servidor
            const newSub = await self.registration.pushManager.subscribe(event.oldSubscription.options);

            console.log('Nueva suscripción generada:', newSub);

            // TODO: enviar newSub al backend
        } catch (err) {
            console.error('Error en pushsubscriptionchange:', err);
        }
    })());
});
