module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  return res.json({
    status: 'ok',
    message: 'Push notification serverless API running',
    endpoints: {
      'GET /api/vapidPublicKey': 'Get VAPID public key',
      'POST /api/subscribe': 'Register push subscription',
      'POST /api/sendNotification': 'Send notification to subscribers',
      'GET /api/subscriptions': 'List subscriptions (debug)'
    }
  });
};
