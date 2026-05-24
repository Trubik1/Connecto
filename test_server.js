const http = require('http');
const fs = require('fs');

// 1. Serve API requests
const messages = [];

http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  messages.push(`${Date.now()} ${req.method} ${req.url}`);

  if (req.url.startsWith('/api/')) {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ status: 'ok', note: 'No database - API calls need seeded data' }));
  } else if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<!DOCTYPE html><html><head><title>API Test Server</title></head><body><h1>API Test Server on Port 3050</h1><p>Test endpoint: <a href="/api/events">/api/events</a></p><p>Messages logged: ' + messages.length + '</p></body></html>');
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
}).listen(3050, () => {
  console.log('Test server on port 3050');
});
