const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    const vapidPath = path.join(__dirname, '..', 'server', 'vapid.json');
    if (!fs.existsSync(vapidPath)) {
      return res.status(404).json({ error: 'VAPID key not found' });
    }

    const data = JSON.parse(fs.readFileSync(vapidPath, 'utf8'));
    return res.json({ publicKey: data.publicKey });
  } catch (err) {
    console.error('Error reading VAPID key:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
