const http = require('http');

const body = JSON.stringify({ name: 'IP Test', role: 'Dev', tags: ['a'], contact: '@iplocal' });
const req = http.request({
  hostname: 'localhost', port: 3000,
  path: '/api/users/profile', method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
}, (res) => {
  let d = ''; res.on('data', c => d += c); res.on('end', () => {
    try {
      const json = JSON.parse(d);
      console.log('Status:', res.statusCode, 'Body:', JSON.stringify(json));
      console.log('res.data.id:', json.id, 'Truthy:', !!json.id);
    } catch(e) { console.log('Raw:', d); }
    process.exit(0);
  });
});
req.on('error', e => { console.log('Error:', e.message); });
req.write(body); req.end();
setTimeout(() => process.exit(1), 10000);
