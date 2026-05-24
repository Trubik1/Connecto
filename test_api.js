const http = require('http');

// Test POST to /api/users/register-to-event
const body = JSON.stringify({ userId: 3, eventId: 5 });
const options = {
  hostname: 'localhost', port: 3000,
  path: '/api/users/register-to-event', method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
};
const req = http.request(options, (res) => {
  let d = ''; res.on('data', c => d += c); res.on('end', () => {
    console.log('POST /api/users/register-to-event status:', res.statusCode);
    console.log('Body:', d);
    if (res.statusCode === 404) {
      // Route not found - the router isn't matching /register-to-event
      console.log('ROUTE NOT FOUND - router might have an issue');
    }
  });
});
req.on('error', e => console.log('Error:', e.message));
req.write(body); req.end();

setTimeout(() => { console.log('timeout after 5s'); process.exit(1); }, 5000);
