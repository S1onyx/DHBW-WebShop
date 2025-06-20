require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const router = require('./routes/router');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // Statische Datei aus /uploads bereitstellen
  if (req.url.startsWith('/uploads/')) {
    const filePath = path.join(__dirname, req.url);
    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('404 Not Found');
      }


      const contentType = mime.lookup(filePath) || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });

      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    });
  } else {
    // Weiterleitung an deine bestehende router.js
    router(req, res);
  }
});

server.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});