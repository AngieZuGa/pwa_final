const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

let vapidKeysInitialized = false;

function initVapidKeys() {
  if (vapidKeysInitialized) return;

  const vapidPath = path.join(__dirname, '..', 'server', 'vapid.json');
  if (!fs.existsSync(vapidPath)) return;

  const { publicKey, privateKey } = JSON.parse(fs.readFileSync(vapidPath));

  webpush.setVapidDetails('mailto:example@example.com', publicKey, privateKey);

  vapidKeysInitialized = true;
  console.log('[sendNotification] VAPID keys loaded');
}

module.exports = async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  initVapidKeys();
  if (!vapidKeysInitialized) return res.status(500).json({ error: 'VAPID keys missing' });

  const { subscription, title, body, data } = req.body;

  if (!subscription) return res.status(400).json({ error: 'Subscription missing' });

  const payload = JSON.stringify({
    title: title || 'Mi PWA',
    body: body || 'Notificación desde servidor',
    data: data || {}
  });

  try {
    await webpush.sendNotification(subscription, payload);

    return res.json({ success: true, message: 'Notification sent successfully' });

  } catch (err) {
    console.error('Push error:', err);
    return res.status(500).json({ error: err.message });
  }
};
