const express = require('express');
const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// ---------------------------------------------------
// 🛠 CORS Middleware Mejorado
// ---------------------------------------------------
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Permitir todos los orígenes
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    req.header('Access-Control-Request-Headers') || 'Content-Type'
  );

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ---------------------------------------------------
// 🔑 Cargar claves VAPID desde variables o vapid.json
// ---------------------------------------------------
let vapidKeys = null;

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY
  };

  webpush.setVapidDetails(
    'mailto:example@example.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );

  console.log('VAPID keys cargadas desde variables de entorno.');

} else {
  const vapidPath = path.join(__dirname, 'vapid.json');

  if (fs.existsSync(vapidPath)) {
    vapidKeys = JSON.parse(fs.readFileSync(vapidPath));

    webpush.setVapidDetails(
      'mailto:example@example.com',
      vapidKeys.publicKey,
      vapidKeys.privateKey
    );

    console.log('VAPID keys cargadas desde vapid.json. Public key:', vapidKeys.publicKey);
  } else {
    console.warn(
      'No se encontró vapid.json ni variables VAPID. Ejecuta `npm run gen:vapid` o configura VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY.'
    );
  }
}

// ---------------------------------------------------
// 📦 Almacenamiento temporal de suscripciones (memory)
// ---------------------------------------------------
const subscriptions = [];

// ---------------------------------------------------
// 🔽 Endpoints
// ---------------------------------------------------

// Obtener clave pública VAPID
app.get('/vapidPublicKey', (req, res) => {
  if (!vapidKeys) return res.status(404).json({ error: 'VAPID key not found' });
  res.json({ publicKey: vapidKeys.publicKey });
});

// Registrar suscripción de un cliente
app.post('/subscribe', (req, res) => {
  const { subscription } = req.body;
  if (!subscription) return res.status(400).json({ error: 'Subscription required' });

  subscriptions.push(subscription);
  console.log('Nueva suscripción guardada. Total:', subscriptions.length);

  res.status(201).json({ success: true });
});

// Depurar suscripciones (solo para desarrollo)
app.get('/subscriptions', (req, res) => {
  res.json({ count: subscriptions.length, subscriptions });
});

// Enviar notificación a todas las suscripciones
app.post('/sendNotification', async (req, res) => {
  const { title = 'Mi PWA', body = 'Mensaje desde el servidor', data = {} } = req.body;

  if (!vapidKeys)
    return res.status(500).json({ error: 'VAPID keys not configured' });

  const payload = JSON.stringify({ title, body, data });

  const results = [];

  await Promise.all(
    subscriptions.map(async (sub, idx) => {
      try {
        await webpush.sendNotification(sub, payload);
        results.push({ idx, status: 'ok' });
      } catch (err) {
        console.error(`Error al enviar notificación ${idx}:`, err.message);
        results.push({ idx, status: 'error', error: err.message });
      }
    })
  );

  res.json({ results });
});

// ---------------------------------------------------
// 🚀 Levantar servidor (local)
// ---------------------------------------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Push server running on http://localhost:${PORT}`));

// Exportar para Vercel
module.exports = app;
