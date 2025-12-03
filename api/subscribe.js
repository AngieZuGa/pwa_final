let subscriptions = [];

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method === 'POST') {
    const { subscription } = req.body;

    if (!subscription) {
      return res.status(400).json({ error: 'Subscription missing' });
    }

    subscriptions.push(subscription);

    return res.json({ success: true });
  }

  if (req.method === 'GET') {
    return res.json(subscriptions);
  }

  res.status(405).json({ error: 'Method not allowed' });
};

// Utility for other modules (not used by sendNotification anymore)
module.exports.getSubscriptions = () => subscriptions;
