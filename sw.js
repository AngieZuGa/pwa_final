// ===============================================
// 📌 Nombre de los cachés
// ===============================================
const CACHE_NAME = "pwa-cache-v1";
const RUNTIME_CACHE = "pwa-runtime-cache-v1";

const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/manifest.json",
  "/offline.html",
];

// ===============================================
// 📌 INSTALACIÓN DEL SW
// ===============================================
self.addEventListener("install", (event) => {
  console.log("📦 Service Worker instalado");

  // Precaching: try to cache each resource individually and tolerate failures
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Keep only http(s) urls and ignore malformed or unsupported schemes
      const filtered = URLS_TO_CACHE.filter((u) => {
        try {
          const full = new URL(u, self.location.href);
          return full.protocol === "http:" || full.protocol === "https:";
        } catch (e) {
          return false;
        }
      });

      // Fetch+put each resource; use allSettled so one failure doesn't reject install
      const results = await Promise.allSettled(
        filtered.map(async (url) => {
          try {
            const res = await fetch(url, { cache: "no-cache" });
            if (!res || !res.ok) throw new Error("Bad response");
            await cache.put(url, res.clone());
            return { url, ok: true };
          } catch (err) {
            console.warn("Service Worker precache failed for:", url, err);
            return { url, ok: false };
          }
        })
      );

      // Optional: log results in dev for easier debugging
      console.log("Precache results:", results);
    })()
  );

  self.skipWaiting();
});

// ===============================================
// 📌 ACTIVACIÓN DEL SW
// ===============================================
self.addEventListener("activate", (event) => {
  console.log("🚀 Service Worker activado");

  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

// ===============================================
// 📌 INTERCEPTAR REQUESTS
// ===============================================
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // ❌ No cachear extensiones (arregla el error chrome-extension)
  if (req.url.startsWith("chrome-extension://")) return;

  // ❌ No cachear APIs de Vercel (push server)
  if (req.url.includes("/api/")) return;

  // Solo manejar GET
  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((res) => {
          return caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(req, res.clone());
            return res;
          });
        })
        .catch(() => caches.match("/offline.html"));
    })
  );
});

// ===============================================
// 📌 MANEJO DE PUSH NOTIFICATIONS
// ===============================================
self.addEventListener("push", (event) => {
  console.log("📨 Push recibido:", event.data ? event.data.text() : "sin datos");

  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    console.warn("Push sin JSON válido");
  }

  const title = data.title || "Notificación";
  const options = {
    body: data.body || "Nuevo mensaje",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    data: data.data || {},
    actions: [
      { action: "open", title: "Abrir" },
      { action: "close", title: "Cerrar" },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ===============================================
// 📌 CLICK EN NOTIFICACIONES
// ===============================================
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") return;

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      const url = "/";

      // Abrir o enfocar pestaña
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
