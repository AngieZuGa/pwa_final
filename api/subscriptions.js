// Shared CORS headers helper
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length');
}

module.exports = (req, res) => {
  setCorsHeaders(res);

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Try to get subscriptions from subscribe.js module
    let subscriptions = [];
    try {
      const subscribeModule = require('./subscribe');
      subscriptions = subscribeModule.getSubscriptions ? subscribeModule.getSubscriptions() : [];
    } catch (e) {
      console.warn('[subscriptions] Could not access subscribe module');
    }

    return res.json({
      count: subscriptions.length,
      subscriptions: subscriptions.map((sub, idx) => ({
        id: idx,
        endpoint: sub.endpoint ? sub.endpoint.substring(0, 50) + '...' : 'N/A',
        keys: sub.keys ? 'present' : 'missing'
      }))
    });
  } catch (err) {
    console.error('[subscriptions] Handler error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
