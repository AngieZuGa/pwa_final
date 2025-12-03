module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({
    status: 'ok',
    message: 'API serverless functions are running',
    endpoints: {
      'GET /api/vapidPublicKey': 'Get VAPID public key',
      'POST /api/subscribe': 'Register push subscription',
      'POST /api/sendNotification': 'Send notification to subscribers',
      'GET /api/subscriptions': 'List subscriptions (debug)'
    }
  });
};
