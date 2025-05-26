// backend/routes/router.js
const withAuth = require('../middleware/withAuth');
const requireRole = require('../middleware/requireRole');
const requireOwnership = require('../middleware/requireOwnership');
const requireValidatedUser = require('../middleware/requireValidatedUser');
const { or, and } = require('../middleware/combine');

const db = require('../db/database');

// Auth APIs
const login = require('../apis/auth/login');
const logout = require('../apis/auth/logout');
const register = require('../apis/auth/register');
const verify = require('../apis/auth/verify');
const requestReset = require('../apis/auth/requestReset');
const resetPassword = require('../apis/auth/resetPassword');
const resendVerification = require('../apis/auth/resendVerification');

// Product APIs
const getAllProducts = require('../apis/products/getAllProducts');
const getProductById = require('../apis/products/getProductById');
const putProduct = require('../apis/products/putProduct');
const deleteProduct = require('../apis/products/deleteProduct');

// User APIs
const getUserById = require('../apis/users/getUserById');

// Cart APIs
const postCart = require('../apis/cart/postCart');
const postCartItem = require('../apis/cart/postCartItem');
const getCart = require('../apis/cart/getCart');
const deleteCartItem = require('../apis/cart/deleteCartItem');
const deleteCart = require('../apis/cart/deleteCart');
const putQuantity = require('../apis/cart/putQuantity');

const routes = [
  // Auth Routes
  { method: 'POST', path: /^\/api\/auth\/login$/, handler: login },
  { method: 'POST', path: /^\/api\/auth\/logout$/, handler: logout },
  { method: 'POST', path: /^\/api\/auth\/register$/, handler: register },
  { method: 'GET', path: /^\/api\/auth\/verify$/, handler: verify },
  { method: 'POST', path: /^\/api\/auth\/request-reset$/, handler: requestReset },
  { method: 'POST', path: /^\/api\/auth\/reset$/, handler: resetPassword },
  { method: 'POST', path: /^\/api\/auth\/resend-verification$/, handler: resendVerification },

  // Product Routes
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
        and(requireRole(1), requireValidatedUser),
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
        and(requireRole(1), requireValidatedUser),
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

  // User Route
  {
    method: 'GET',
    path: /^\/api\/users\/(\d+)$/,
    handler: withAuth(
      or(
        and(requireRole(1), requireValidatedUser),
        and(requireOwnership((req) => parseInt(req.params[0], 10)), requireValidatedUser)
      )((req, res) => getUserById(req, res, req.params[0]))
    )
  },

  // Cart Routes
  {
    method: 'GET',
    path: /^\/api\/carts$/,
    handler: withAuth(
        and(requireRole(3), requireValidatedUser)
        ((req, res) => getCart(req, res))
    )
  },
  {
    method: 'POST',
    path: /^\/api\/carts$/,
    handler: withAuth(
      and(requireRole(3), requireValidatedUser)
      ((req, res) => postCart(req, res))
    )
  },
  {
    method: 'DELETE',
    path: /^\/api\/carts$/,
    handler: withAuth(
        and(requireRole(3), requireValidatedUser)
        ((req, res) => deleteCart(req, res))
    )
  },
  {
    method: 'POST',
    path: /^\/api\/carts\/items$/,
    handler: withAuth(
      and(requireRole(3), requireValidatedUser)
      ((req, res) => postCartItem(req, res))
    )
  },
  {
    method: 'DELETE',
    path: /^\/api\/carts\/items$/,
    handler: withAuth(
      and(requireRole(3), requireValidatedUser)
      ((req, res) => deleteCartItem(req, res))
    )
  },
  {
    method: 'PUT',
    path: /^\/api\/carts\/items$/,
    handler: withAuth(
      and(requireRole(3), requireValidatedUser)
      ((req, res) => putQuantity(req, res))
    )
  },
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
    try {
      return await route.handler(req, res, req.params, req.query);
    } catch (err) {
      console.error('[ROUTER ERROR]', {
        method: req.method,
        url: req.url,
        error: err
      });
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Internal server error', code: 500 }));
    }
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, error: 'Route nicht gefunden', code: 404 }));
};
