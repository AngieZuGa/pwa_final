// Shared CORS headers helper
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length');
}

// In-memory subscription store (persists for the lifetime of the function instance)
// For production, use a database like MongoDB, PostgreSQL, etc.
let subscriptions = [];

module.exports = (req, res) => {
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
    const { subscription } = req.body;

    if (!subscription) {
      return res.status(400).json({ error: 'Subscription object required in request body' });
    }

    if (!subscription.endpoint) {
      return res.status(400).json({ error: 'Subscription must have an endpoint' });
    }

    // Add to in-memory store (avoid duplicates)
    const exists = subscriptions.some(sub => sub.endpoint === subscription.endpoint);
    if (!exists) {
      subscriptions.push(subscription);
      console.log('[API] New subscription saved. Total:', subscriptions.length);
    } else {
      console.log('[API] Subscription already exists. Updating...');
    }

    return res.status(201).json({
      success: true,
      message: 'Subscription registered',
      total: subscriptions.length
    });
  } catch (err) {
    console.error('Error in subscribe handler:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Export for testing
module.exports.getSubscriptions = () => subscriptions;
module.exports.setSubscriptions = (subs) => { subscriptions = subs; };
