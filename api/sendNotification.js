const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Load VAPID keys
    const vapidPath = path.join(__dirname, '..', 'server', 'vapid.json');
    if (!fs.existsSync(vapidPath)) {
      return res.status(500).json({ error: 'VAPID keys not configured' });
    }

    const vapidKeys = JSON.parse(fs.readFileSync(vapidPath, 'utf8'));
    webpush.setVapidDetails(
      'mailto:example@example.com',
      vapidKeys.publicKey,
      vapidKeys.privateKey
    );

    // In-memory subscription store (for demo; use database in production)
    // This won't persist across function invocations in production
    if (!global.subscriptions) {
      global.subscriptions = [];
    }

    const { title = 'Mi PWA', body = 'Notificación desde servidor', data = {} } = req.body;
    const payload = JSON.stringify({ title, body, data });

    const results = [];
    await Promise.all(
      (global.subscriptions || []).map(async (sub, idx) => {
        try {
          await webpush.sendNotification(sub, payload);
          results.push({ idx, status: 'ok' });
        } catch (err) {
          console.error(`Error sending notification ${idx}:`, err.message);
          results.push({ idx, status: 'error', error: err.message });
        }
      })
    );

    return res.json({ results, message: `Sent to ${results.length} subscribers` });
  } catch (err) {
    console.error('Error in sendNotification:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
