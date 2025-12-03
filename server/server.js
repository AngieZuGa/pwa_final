const express = require('express');
const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// CORS Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Cargar claves VAPID desde vapid.json en la carpeta del servidor
let vapidKeys = null;
const vapidPath = path.join(__dirname, 'vapid.json');
if (fs.existsSync(vapidPath)) {
  vapidKeys = JSON.parse(fs.readFileSync(vapidPath));
  webpush.setVapidDetails('mailto:example@example.com', vapidKeys.publicKey, vapidKeys.privateKey);
  console.log('VAPID keys cargadas. Public key:', vapidKeys.publicKey);
} else {
  console.warn('No se encontró vapid.json. Ejecuta `npm run gen:vapid` o crea vapid.json con las claves VAPID.');
}

const subscriptions = [];

app.get('/vapidPublicKey', (req, res) => {
  if (!vapidKeys) return res.status(404).json({ error: 'VAPID key not found' });
  res.json({ publicKey: vapidKeys.publicKey });
});

app.post('/subscribe', (req, res) => {
  const { subscription } = req.body;
  if (!subscription) return res.status(400).json({ error: 'Subscription required' });

  // Guardar suscripción en memoria (ejemplo). En producción usar DB.
  subscriptions.push(subscription);
  console.log('Nueva suscripción guardada. Total:', subscriptions.length);
  res.status(201).json({ success: true });
});

// Endpoint de depuración (desarrollo): listar suscripciones guardadas
app.get('/subscriptions', (req, res) => {
  res.json({ count: subscriptions.length, subscriptions });
});

app.post('/sendNotification', async (req, res) => {
  const { title = 'Mi PWA', body = 'Mensaje desde el servidor', data = {} } = req.body;
  const payload = JSON.stringify({ title, body, data });

  if (!vapidKeys) return res.status(500).json({ error: 'VAPID keys not configured' });

  const results = [];
  await Promise.all(subscriptions.map(async (sub, idx) => {
    try {
      await webpush.sendNotification(sub, payload);
      results.push({ idx, status: 'ok' });
    } catch (err) {
      console.error('Error al enviar notificación a subscription', idx, err.message || err);
      results.push({ idx, status: 'error', error: err.message });
    }
  }));

  res.json({ results });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Push server running on http://localhost:${PORT}`));

// Exportar para Vercel
module.exports = app;
