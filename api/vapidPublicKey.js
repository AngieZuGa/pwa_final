const fs = require('fs');
const path = require('path');

// Shared CORS headers helper
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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
    // Try to read VAPID keys from server/vapid.json
    const vapidPath = path.join(__dirname, '..', 'server', 'vapid.json');
    
    if (!fs.existsSync(vapidPath)) {
      console.warn('vapid.json not found at:', vapidPath);
      return res.status(500).json({ error: 'VAPID keys not configured' });
    }

    const vapidData = JSON.parse(fs.readFileSync(vapidPath, 'utf8'));
    
    if (!vapidData.publicKey) {
      return res.status(500).json({ error: 'Public key not found in vapid.json' });
    }

    return res.json({ publicKey: vapidData.publicKey });
  } catch (err) {
    console.error('Error reading VAPID key:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
