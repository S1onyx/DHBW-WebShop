// backend/routes/router.js
const withAuth = require('../middleware/withAuth');
const requireRole = require('../middleware/requireRole');
const requireOwnership = require('../middleware/requireOwnership');
const requireValidatedUser = require('../middleware/requireValidatedUser');
const { or, and } = require('../middleware/combine');

const login = require('../apis/auth/login');
const logout = require('../apis/auth/logout');
const register = require('../apis/auth/register');
const verify = require('../apis/auth/verify');
const requestReset = require('../apis/auth/requestReset');
const resetPassword = require('../apis/auth/resetPassword');
const resendVerification = require('../apis/auth/resendVerification');

const getAllProducts = require('../apis/products/getAllProducts');
const getProductById = require('../apis/products/getProductById');
const putProduct = require('../apis/products/putProduct');
const deleteProduct = require('../apis/products/deleteProduct');

const getUserById = require('../apis/users/getUserById');

const db = require('../db/database');

const routes = [
  { method: 'POST', path: /^\/api\/auth\/login$/, handler: login },
  { method: 'POST', path: /^\/api\/auth\/logout$/, handler: logout },
  { method: 'POST', path: /^\/api\/auth\/register$/, handler: register },
  { method: 'GET', path: /^\/api\/auth\/verify$/, handler: verify },
  { method: 'POST', path: /^\/api\/auth\/request-reset$/, handler: requestReset },
  { method: 'POST', path: /^\/api\/auth\/reset$/, handler: resetPassword },
  { method: 'POST', path: /^\/api\/auth\/resend-verification$/, handler: resendVerification },

  {
    method: 'GET',
    path: /^\/api\/products$/,
    handler: (req, res) => getAllProducts(req, res, req.query)
  },

  {
    method: 'GET',
    path: /^\/api\/products\/(\d+)$/,
    handler: (req, res, params) => getProductById(req, res, params[0])
  },

  {
    method: 'PUT',
    path: /^\/api\/products\/(\d+)$/,
    handler: withAuth(
      or(
        and(
        requireRole(1),
        requireValidatedUser
        ),
        and(
          requireOwnership(async (req) => {
            const result = await db.query('SELECT seller_id FROM products WHERE id = $1', [req.params[0]]);
            return result.rows[0]?.seller_id ?? null;
          }),
          requireValidatedUser
        )
      )((req, res) => putProduct(req, res, req.params[0]))
    )
  },

  {
    method: 'DELETE',
    path: /^\/api\/products\/(\d+)$/,
    handler: withAuth(
      or(
        and(
        requireRole(1),
        requireValidatedUser
        ),
        and(
        requireOwnership(async (req) => {
          const result = await db.query('SELECT seller_id FROM products WHERE id = $1', [req.params[0]]);
          return result.rows[0]?.seller_id ?? null;
        }),
        requireValidatedUser
      )
      )((req, res) => deleteProduct(req, res, new URLSearchParams(`id=${req.params[0]}`)))
    )
  },

  {
    method: 'GET',
    path: /^\/api\/users\/(\d+)$/,
    handler: withAuth(
      or(
        requireRole(1),
        requireOwnership((req) => parseInt(req.params[0], 10))
      )((req, res) => getUserById(req, res, req.params[0]))
    )
  }
];

module.exports = async function router(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  req.query = url.searchParams;
  req.params = [];

  for (const route of routes) {
    if (req.method !== route.method) continue;
    const match = url.pathname.match(route.path);
    if (!match) continue;
    req.params = match.slice(1);
    return route.handler(req, res, req.params, req.query);
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Route nicht gefunden' }));
};