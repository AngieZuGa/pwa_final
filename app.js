console.log("📌 app.js cargado");

// ----------------------------------------------------
// CONFIG
// ----------------------------------------------------
const API_URL = "https://pwa-final-beta.vercel.app/api";

let registration = null;
let userSubscription = null;

// ----------------------------------------------------
// UTILIDAD: TOAST
// ----------------------------------------------------
function showToast(msg, type = "info") {
    const box = document.createElement("div");
    box.textContent = msg;
    box.className = `toast ${type}`;
    document.body.appendChild(box);

    setTimeout(() => box.remove(), 3000);
}

// ----------------------------------------------------
// 1️⃣ REGISTRAR SERVICE WORKER
// ----------------------------------------------------
async function registerSW() {
    if (!("serviceWorker" in navigator)) {
        showToast("Service Worker NO soportado", "error");
        return;
    }

    try {
        registration = await navigator.serviceWorker.register("sw.js");
        console.log("✓ Service Worker registrado:", registration);
        showToast("Service Worker activo ✔", "success");
    } catch (err) {
        console.error("Error registrando SW:", err);
        showToast("Error registrando SW", "error");
    }
}

// ----------------------------------------------------
// 2️⃣ OBTENER VAPID PUBLIC KEY DESDE EL SERVIDOR
// ----------------------------------------------------
async function getVapidKey() {
    try {
        const res = await fetch(`${API_URL}/vapidPublicKey`);
        const data = await res.json();

        if (!data.publicKey) {
            throw new Error("No se obtuvo la llave pública");
        }

        console.log("✓ VAPID public key:", data.publicKey);
        return data.publicKey;
    } catch (err) {
        console.error("Error obteniendo VAPID key:", err);
        showToast("Error obteniendo VAPID key", "error");
        return null;
    }
}

// Convertir Base64 a UInt8Array para `pushManager.subscribe`
function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(x => x.charCodeAt(0)));
}

// ----------------------------------------------------
// 3️⃣ SUSCRIBIR AL USUARIO A PUSH
// ----------------------------------------------------
async function subscribeToPush() {
    try {
        if (!registration) {
            showToast("Service Worker no está listo", "error");
            return;
        }

        const publicKey = await getVapidKey();
        if (!publicKey) return;

        userSubscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey)
        });

        console.log("✓ PushSubscription generada:", userSubscription);

        // Enviar suscripción al servidor
        await fetch(`${API_URL}/subscribe`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subscription: userSubscription })
        });

        showToast("Notificaciones activadas ✔", "success");
    } catch (err) {
        console.error("Error al suscribirse:", err);
        showToast("Error al activar notificaciones", "error");
    }
}

// ----------------------------------------------------
// 4️⃣ ENVIAR NOTIFICACIÓN DE PRUEBA
// ----------------------------------------------------
async function sendTestPush() {
    try {
        if (!userSubscription) {
            showToast("Activa las notificaciones primero", "error");
            return;
        }

        const res = await fetch(`${API_URL}/sendNotification`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                subscription: userSubscription,
                title: "Notificación de prueba",
                body: "Todo funciona perfecto 🚀",
                data: { url: "/" }
            })
        });

        if (!res.ok) {
            const txt = await res.text();
            console.error("Error del servidor:", txt);
            throw new Error("No se pudo enviar");
        }

        showToast("Notificación enviada ✔", "success");
        console.log("✓ Notificación de prueba enviada");
    } catch (err) {
        console.error("Error enviando notificación:", err);
        showToast("Error al enviar notificación", "error");
    }
}

// ----------------------------------------------------
// EVENTOS BOTONES
// ----------------------------------------------------
document.getElementById("btnEnableNotifications")
    ?.addEventListener("click", subscribeToPush);

document.getElementById("btnSendTest")
    ?.addEventListener("click", sendTestPush);

// ----------------------------------------------------
// INICIO
// ----------------------------------------------------
registerSW();
