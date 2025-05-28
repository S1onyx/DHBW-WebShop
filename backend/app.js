// app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
// Optionale Middleware
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Globale Middleware
app.use(express.json({ limit: '1mb' }));       // JSON-Body automatisch parsen (max 1 MB, analog bisheriger Limitierung) [oai_citation:12‡github.com](https://github.com/S1onyx/DHBW-WebShop/blob/54ef298dce5cf38803ff2c02ebde440b64a9cd84/backend/apis/auth/login.js#L11-L19)
app.use(cookieParser());                      // Cookies parsen, damit req.cookies verfügbar ist (optional, erleichtert Auth)

// Static Files (Frontend)
app.use(express.static(path.join(__dirname, '../frontend')));  // frontend/-Ordner statisch bereitstellen

// Router-Module einbinden
const authRouter = require('./routes/authRoutes');
const productRouter = require('./routes/productRoutes');
// (etc. für alle Router)
app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
// ... analog für users, orders, reviews, cart, wishlists ...

// Catch-All für nicht gefundene Routen (404)
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route nicht gefunden', code: 404 });
});

// (Optional) Frontend-Routing: Unbekannte Pfade an index.html liefern, falls SPA-Routing genutzt wird
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Zentrale Fehlerbehandlung (Dummy)
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ success: false, error: 'Internal server error', code: 500 });
});

// Serverstart
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});