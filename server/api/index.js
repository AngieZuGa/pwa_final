// Vercel Serverless Function Handler
const express = require('express');
const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// CORS Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Cargar claves VAPID desde variables de entorno o vapid.json
let vapidKeys = null;

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY
  };
  webpush.setVapidDetails('mailto:example@example.com', vapidKeys.publicKey, vapidKeys.privateKey);
  console.log('[Vercel] VAPID keys cargadas desde variables de entorno');
} else {
  const vapidPath = path.join(__dirname, '../vapid.json');
  if (fs.existsSync(vapidPath)) {
    try {
      vapidKeys = JSON.parse(fs.readFileSync(vapidPath, 'utf8'));
      webpush.setVapidDetails('mailto:example@example.com', vapidKeys.publicKey, vapidKeys.privateKey);
      console.log('[Vercel] VAPID keys cargadas desde vapid.json');
    } catch (err) {
      console.error('[Vercel] Error leyendo vapid.json:', err.message);
    }
  }
}

const subscriptions = [];

// Endpoint: Obtener clave pública VAPID
app.get('/vapidPublicKey', (req, res) => {
  if (!vapidKeys) {
    return res.status(500).json({ error: 'VAPID keys not configured' });
  }
  res.json({ publicKey: vapidKeys.publicKey });
});

// Endpoint: Registrar suscripción
app.post('/subscribe', (req, res) => {
  const { subscription } = req.body;
  if (!subscription) {
    return res.status(400).json({ error: 'Subscription required' });
  }
  subscriptions.push(subscription);
  console.log('[Vercel] Nueva suscripción guardada. Total:', subscriptions.length);
  res.status(201).json({ success: true });
});

// Endpoint: Debug - listar suscripciones
app.get('/subscriptions', (req, res) => {
  res.json({ count: subscriptions.length, subscriptions });
});

// Endpoint: Enviar notificación a todas las suscripciones
app.post('/sendNotification', async (req, res) => {
  const { title = 'Mi PWA', body = 'Notificación desde servidor', data = {} } = req.body;

  if (!vapidKeys) {
    return res.status(500).json({ error: 'VAPID keys not configured' });
  }

  const payload = JSON.stringify({ title, body, data });
  const results = [];

  await Promise.all(
    subscriptions.map(async (sub, idx) => {
      try {
        await webpush.sendNotification(sub, payload);
        results.push({ idx, status: 'ok' });
      } catch (err) {
        console.error(`[Vercel] Error enviando notificación ${idx}:`, err.message);
        results.push({ idx, status: 'error', error: err.message });
      }
    })
  );

  res.json({ results });
});

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Push notification server running' });
});

// Exportar para Vercel
module.exports = app;
