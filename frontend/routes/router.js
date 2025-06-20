const express = require('express');
const path = require('path');
const fs = require('fs');
const {
  getUserFromCookie,
  requireAuth,
  requireRole,
  requireStatus,
} = require('../public/js/auth');

const router = express.Router();

function renderPage(page, res) {
  const fullPath = path.join(__dirname, '..', 'views', page);
  fs.readFile(fullPath, 'utf-8', (err, content) => {
    if (err) return res.status(500).send('Seitenfehler');
    res.send(content);
  });
}

router.get('/', async (req, res) => {
  renderPage('index.html', res);
});

router.get(
  '/admin',
  requireAuth,
  requireStatus('validated'),
  requireRole('Admin'),
  (req, res) => {
    renderPage('admin.html', res);
  }
);

router.get('/unauthorized', (req, res) => {
  renderPage('unauthorized.html', res);
});

router.get('/login', (req, res) => {
  renderPage('login.html', res);
});

router.get('/signup', (req, res) => {
  renderPage('signup.html', res);
});

router.get('/reset-password', (req, res) => {
  renderPage('reset-password.html', res);
});

module.exports = router;