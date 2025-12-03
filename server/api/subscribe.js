module.exports = (req, res) => {
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
    const { subscription } = req.body;
    if (!subscription) {
      return res.status(400).json({ error: 'Subscription required' });
    }

    // In-memory subscription store (for demo)
    if (!global.subscriptions) {
      global.subscriptions = [];
    }

    global.subscriptions.push(subscription);
    console.log('[API] New subscription saved. Total:', global.subscriptions.length);

    return res.status(201).json({ success: true, subscriptions: global.subscriptions.length });
  } catch (err) {
    console.error('Error in subscribe:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
