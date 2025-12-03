// Registrar Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => {
                console.log('✓ Service Worker registrado:', reg);
                updateSWStatus(true);
            })
            .catch(err => {
                console.error('✗ Error al registrar Service Worker:', err);
                updateSWStatus(false);
            });
    });
}

// Estado online/offline
window.addEventListener('online', () => {
    updateOnlineStatus(true);
    showToast('✓ Conexión establecida', 'success');
});

window.addEventListener('offline', () => {
    updateOnlineStatus(false);
    showToast('⚠ Sin conexión a internet', 'error');
});

// Detectar estado inicial
function updateOnlineStatus(online) {
    const badge = document.getElementById('onlineStatus');
    if (online) {
        badge.textContent = 'Online';
        badge.className = 'status-badge online';
    } else {
        badge.textContent = 'Offline';
        badge.className = 'status-badge offline';
    }
}

function updateSWStatus(active) {
    const badge = document.getElementById('swStatus');
    if (active) {
        badge.textContent = 'Activo';
        badge.className = 'status-badge active';
    } else {
        badge.textContent = 'Inactivo';
        badge.className = 'status-badge offline';
    }
}

// API Configuration
const API_BASE = 'https://jsonplaceholder.typicode.com';

// -------------------------------------------------------------
// 🔥 CONFIGURACIÓN PUSH SERVER (LOCAL + PRODUCCIÓN VERCEL)
// -------------------------------------------------------------
const PUSH_SERVER =
    window.location.hostname === 'localhost'
        ? 'http://localhost:4000'
        : 'https://pwa-final-beta.vercel.app';

// -------------------------------------------------------------

// Sistema de Pestañas
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        switchTab(tabName);
    });
});

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');

    if (tabName === 'posts') loadPosts();
    if (tabName === 'usuarios') loadUsers();
}

// Cargar Posts
async function loadPosts() {
    const container = document.getElementById('postsContainer');
    const loading = document.getElementById('postsLoading');

    try {
        loading.style.display = 'block';
        container.innerHTML = '';

        const response = await fetch(`${API_BASE}/posts?_limit=10`);
        if (!response.ok) throw new Error('Error en la solicitud');

        const posts = await response.json();

        posts.forEach(post => {
            const card = document.createElement('div');
            card.className = 'post-card';
            card.innerHTML = `
                <div class="post-id">Post #${post.id}</div>
                <h4>${post.title}</h4>
                <p>${post.body}</p>
                <small style="color: var(--text-light);">Usuario ID: ${post.userId}</small>
            `;
            container.appendChild(card);
        });

        loading.style.display = 'none';
        showToast('✓ Posts cargados exitosamente', 'success');
    } catch (error) {
        loading.style.display = 'none';
        container.innerHTML = `<p style="color: var(--danger-color);">Error al cargar posts: ${error.message}</p>`;
        showToast('✗ Error al cargar posts', 'error');
        console.error('Error:', error);
    }
}

// Cargar Usuarios
async function loadUsers() {
    const container = document.getElementById('usersContainer');
    const loading = document.getElementById('usuariosLoading');

    try {
        loading.style.display = 'block';
        container.innerHTML = '';

        const response = await fetch(`${API_BASE}/users`);
        if (!response.ok) throw new Error('Error en la solicitud');

        const users = await response.json();

        users.forEach(user => {
            const card = document.createElement('div');
            card.className = 'user-card';
            const avatar = user.name.charAt(0).toUpperCase();
            card.innerHTML = `
                <div class="user-avatar">${avatar}</div>
                <h4>${user.name}</h4>
                <p><strong>@${user.username}</strong></p>
                <p class="user-email">${user.email}</p>
                <small style="color: var(--text-light);">ID: ${user.id}</small>
            `;
            container.appendChild(card);
        });

        loading.style.display = 'none';
        showToast('✓ Usuarios cargados exitosamente', 'success');
    } catch (error) {
        loading.style.display = 'none';
        container.innerHTML = `<p style="color: var(--danger-color);">Error al cargar usuarios: ${error.message}</p>`;
        showToast('✗ Error al cargar usuarios', 'error');
        console.error('Error:', error);
    }
}

// Botón Sincronizar
document.getElementById('syncBtn').addEventListener('click', () => {
    const btn = document.getElementById('syncBtn');
    btn.classList.add('syncing');

    setTimeout(() => {
        btn.classList.remove('syncing');
        showToast('✓ Sincronización completada', 'success');
    }, 2000);
});

// Limpiar Cache
document.getElementById('clearCacheBtn').addEventListener('click', async () => {
    try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        showToast('✓ Cache limpiado correctamente', 'success');
        updateCacheSize();
    } catch (error) {
        showToast('✗ Error al limpiar cache', 'error');
        console.error('Error:', error);
    }
});

// Desinstalar Service Worker
document.getElementById('uninstallBtn').addEventListener('click', async () => {
    try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        registrations.forEach(reg => reg.unregister());
        showToast('✓ Service Worker desinstalado', 'success');
        updateSWStatus(false);
    } catch (error) {
        showToast('✗ Error al desinstalar Service Worker', 'error');
        console.error('Error:', error);
    }
});

// Calcular tamaño de cache
async function updateCacheSize() {
    try {
        if ('estimate' in navigator.storage) {
            const estimate = await navigator.storage.estimate();
            const usage = (estimate.usage / 1024 / 1024).toFixed(2);
            document.getElementById('cacheSize').textContent = `${usage} MB`;
        } else {
            document.getElementById('cacheSize').textContent = 'No disponible';
        }
    } catch (error) {
        document.getElementById('cacheSize').textContent = 'Error al calcular';
    }
}

// Sistema de Notificaciones Toast
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// PWA Install
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('installBtn').style.display = 'inline-block';
});

document.getElementById('installBtn').addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        deferredPrompt = null;
        document.getElementById('installBtn').style.display = 'none';
    }
});

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    updateOnlineStatus(navigator.onLine);
    updateCacheSize();
});

// -------------------------
// Push Notifications
// -------------------------

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

async function getVapidPublicKey() {
    try {
        const resp = await fetch(`${PUSH_SERVER}/vapidPublicKey`);
        if (!resp.ok) throw new Error('No VAPID key available');
        const data = await resp.json();
        return data.publicKey;
    } catch (err) {
        console.warn('No se obtuvo VAPID key desde el servidor:', err.message);
        return null;
    }
}

async function subscribeForPush() {
    if (!('serviceWorker' in navigator)) {
        showToast('Service Worker no disponible', 'error');
        return;
    }

    if (!('PushManager' in window)) {
        showToast('Push no soportado en este navegador', 'error');
        return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        updatePushStatus('Denegado');
        showToast('Permiso de notificaciones denegado', 'error');
        return;
    }

    const registration = await navigator.serviceWorker.ready;
    const publicKey = await getVapidPublicKey();
    if (!publicKey) {
        updatePushStatus('Falta clave VAPID');
        showToast('No hay clave VAPID disponible en el servidor', 'error');
        return;
    }

    try {
        const sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey)
        });

        await fetch(`${PUSH_SERVER}/subscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription: sub })
        });

        updatePushStatus('Suscrito');
        showToast('Suscripción a notificaciones completada', 'success');
    } catch (err) {
        console.error('Error en suscripción push:', err);
        updatePushStatus('Error');
        showToast('Error al suscribirse a push', 'error');
    }
}

async function sendTestPush() {
    try {
        const resp = await fetch(`${PUSH_SERVER}/sendNotification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: 'Prueba',
                body: 'Notificación de prueba desde el servidor'
            })
        });

        if (!resp.ok) throw new Error('Error al enviar notificación');

        showToast('Solicitud enviada', 'success');
    } catch (err) {
        console.error('Error enviando notificación:', err);
        showToast('Error al solicitar notificación de prueba', 'error');
    }
}

function updatePushStatus(text) {
    const el = document.getElementById('pushStatus');
    if (!el) return;
    el.textContent = text;

    if (text === 'Suscrito') {
        el.className = 'status-badge active';
    } else if (text === 'Denegado' || text === 'Error') {
        el.className = 'status-badge offline';
    } else {
        el.className = 'status-badge';
    }
}

// Botones
document.addEventListener('DOMContentLoaded', () => {
    const enableBtn = document.getElementById('enablePushBtn');
    const testBtn = document.getElementById('sendTestPushBtn');

    if (enableBtn) enableBtn.addEventListener('click', subscribeForPush);
    if (testBtn) testBtn.addEventListener('click', sendTestPush);

    if (Notification && Notification.permission) {
        updatePushStatus(
            Notification.permission === 'granted'
                ? 'Permiso concedido'
                : Notification.permission
        );
    }
});
