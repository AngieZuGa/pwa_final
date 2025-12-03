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

// In-memory subscription store (same as subscribe.js, but shared via require in production)
let subscriptions = [];

// Initialize VAPID keys on first call
let vapidKeysInitialized = false;

function initVapidKeys() {
  if (vapidKeysInitialized) return;

  try {
    const vapidPath = path.join(__dirname, '..', 'server', 'vapid.json');
    
    if (fs.existsSync(vapidPath)) {
      const vapidData = JSON.parse(fs.readFileSync(vapidPath, 'utf8'));
      
      if (vapidData.publicKey && vapidData.privateKey) {
        webpush.setVapidDetails(
          'mailto:example@example.com',
          vapidData.publicKey,
          vapidData.privateKey
        );
        console.log('[sendNotification] VAPID keys initialized from vapid.json');
        vapidKeysInitialized = true;
      }
    } else {
      console.warn('[sendNotification] vapid.json not found');
    }
  } catch (err) {
    console.error('[sendNotification] Error initializing VAPID keys:', err.message);
  }
}

module.exports = async (req, res) => {
  setCorsHeaders(res);

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize VAPID keys if not already done
    initVapidKeys();

    const { title = 'Mi PWA', body = 'Notificación desde servidor', data = {} } = req.body;

    if (!vapidKeysInitialized) {
      return res.status(500).json({ error: 'VAPID keys not configured' });
    }

    // Get subscriptions from subscribe.js module if available
    // Otherwise use in-memory array (won't persist across invocations in production)
    let subs = subscriptions;
    try {
      const subscribeModule = require('./subscribe');
      subs = subscribeModule.getSubscriptions ? subscribeModule.getSubscriptions() : subscriptions;
    } catch (e) {
      console.warn('[sendNotification] Could not access subscribe module');
    }

    if (!subs || subs.length === 0) {
      return res.status(400).json({ error: 'No subscriptions available' });
    }

    const payload = JSON.stringify({ title, body, data });
    const results = [];

    // Send notifications to all subscriptions
    await Promise.all(
      subs.map(async (sub, idx) => {
        try {
          await webpush.sendNotification(sub, payload);
          results.push({ idx, endpoint: sub.endpoint?.substring(0, 50) + '...', status: 'ok' });
          console.log(`[sendNotification] Notification sent to subscription ${idx}`);
        } catch (err) {
          console.error(`[sendNotification] Error sending to subscription ${idx}:`, err.message);
          results.push({ idx, status: 'error', error: err.message });
        }
      })
    );

    return res.json({
      success: true,
      message: `Sent to ${subs.length} subscribers`,
      results
    });
  } catch (err) {
    console.error('[sendNotification] Handler error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
