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

// Instalar Service Worker
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

// Activar Service Worker
self.addEventListener('activate', event => {
    console.log('🚀 Service Worker activado');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                        console.log('🗑️  Eliminando caché antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Interceptar solicitudes (Fetch)
self.addEventListener('fetch', event => {
    const { request } = event;

    // Solo interceptar GET
    if (request.method !== 'GET') {
        return;
    }

    // Para solicitudes a API externa
    if (request.url.includes('jsonplaceholder.typicode.com')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Guardar en runtime cache si es exitosa
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(RUNTIME_CACHE).then(cache => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Si falla, intentar obtener del cache
                    return caches.match(request)
                        .then(response => response || createOfflineResponse());
                })
        );
        return;
    }

    // Estrategia Cache First para archivos estáticos
    event.respondWith(
        caches.match(request)
            .then(response => {
                if (response) {
                    return response;
                }
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

function createOfflineResponse() {
    return new Response(
        '<h1>Modo Offline</h1><p>La conexión no está disponible. Por favor, intenta más tarde.</p>',
        {
            status: 200,
            statusText: 'OK',
            headers: new Headers({
                'Content-Type': 'text/html; charset=UTF-8'
            })
        }
    );
}

// Sincronización en background
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
        await cache.put('https://jsonplaceholder.typicode.com/posts?_limit=10', 
            new Response(JSON.stringify(data)));
    } catch (error) {
        console.error('Error en sincronización:', error);
    }
}

// Manejo de Push Notifications
self.addEventListener('push', event => {
    let payload = { title: 'Notificación', body: 'Tienes una nueva notificación.' };
    try {
        if (event.data) {
            payload = event.data.json();
        }
    } catch (e) {
        console.error('Error parseando payload push', e);
    }

    const title = payload.title || 'Mi PWA';
    const options = {
        body: payload.body || '',
        icon: payload.icon || '/assets/image.png',
        badge: payload.badge || '/assets/image.png',
        data: payload.data || {},
        tag: payload.tag || undefined
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    const urlToOpen = event.notification.data && event.notification.data.url ? event.notification.data.url : '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
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

// Manejar cambios en la suscripción (ej: VAPID renovado)
self.addEventListener('pushsubscriptionchange', event => {
    console.log('pushsubscriptionchange event', event);
    event.waitUntil((async () => {
        try {
            const registration = await self.registration;
            // Aquí idealmente se volvería a suscribir y enviar al servidor
            // Pero la lógica depende del servidor y la clave VAPID
        } catch (err) {
            console.error('Error al manejar pushsubscriptionchange', err);
        }
    })());
});
