// Genera claves VAPID usando web-push y las guarda en vapid.json
const webpush = require('web-push');
const fs = require('fs');

const keys = webpush.generateVAPIDKeys();
fs.writeFileSync('vapid.json', JSON.stringify(keys, null, 2));
console.log('Claves VAPID generadas y guardadas en vapid.json');
console.log(keys);
