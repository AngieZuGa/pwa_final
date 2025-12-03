const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

// Shared CORS headers helper
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length');
}

// Initialize VAPID keys (loaded once)
let vapidKeysInitialized = false;

function initVapidKeys() {
  if (vapidKeysInitialized) return;

  try {
    const vapidPath = path.join(__dirname, '..', 'server', 'vapid.json');

    if (!fs.existsSync(vapidPath)) {
      console.error('[sendNotification] ❌ ERROR: vapid.json NOT FOUND.');
      return;
    }

    const { publicKey, privateKey } = JSON.parse(fs.readFileSync(vapidPath, 'utf8'));

    if (!publicKey || !privateKey) {
      console.error('[sendNotification] ❌ ERROR: vapid.json incomplete.');
      return;
    }

    webpush.setVapidDetails(
      'mailto:example@example.com',
      publicKey,
      privateKey
    );

    vapidKeysInitialized = true;
    console.log('[sendNotification] ✓ VAPID keys initialized');
  } catch (err) {
    console.error('[sendNotification] Error reading VAPID keys:', err.message);
  }
}

module.exports = async (req, res) => {
  setCorsHeaders(res);

  // Handle OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Accept only POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    initVapidKeys();

    if (!vapidKeysInitialized) {
      return res.status(500).json({ error: 'VAPID keys not configured' });
    }

    // Extract subscription and payload
    const {
      subscription,
      title = 'Mi PWA',
      body = 'Notificación desde servidor',
      data = {}
    } = req.body;

    // Validate subscription
    if (!subscription) {
      console.error('[sendNotification] ❌ No subscription in request body');
      return res.status(400).json({ error: 'Subscription missing' });
    }

    // Build payload
    const payload = JSON.stringify({ title, body, data });

    console.log('[sendNotification] → Sending push to ONE subscription');

    // Try sending notification
    try {
      await webpush.sendNotification(subscription, payload);
      console.log('[sendNotification] ✓ Notification sent OK');
    } catch (err) {
      console.error('[sendNotification] ERROR sending notification:', err.message);
      return res.status(500).json({ error: err.message });
    }

    // Success response
    return res.json({
      success: true,
      message: 'Notification sent successfully'
    });

  } catch (err) {
    console.error('[sendNotification] Handler error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
