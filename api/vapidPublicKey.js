const fs = require('fs');
const path = require('path');

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = (req, res) => {
  setCorsHeaders(res);

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const vapidPath = path.join(__dirname, '..', 'server', 'vapid.json');

    if (!fs.existsSync(vapidPath)) {
      return res.status(500).json({ error: 'vapid.json not found' });
    }

    const { publicKey } = JSON.parse(fs.readFileSync(vapidPath, 'utf8'));

    return res.json({ publicKey });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
