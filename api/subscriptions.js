module.exports = (req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // In-memory subscription store (for demo)
    if (!global.subscriptions) {
      global.subscriptions = [];
    }

    return res.json({
      count: global.subscriptions.length,
      subscriptions: global.subscriptions
    });
  } catch (err) {
    console.error('Error in subscriptions:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
