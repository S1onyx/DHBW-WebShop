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

const postProductImage = require('../apis/products/postProductImage');
const putProductImage = require('../apis/products/putProductImage');
const deleteProductImage = require('../apis/products/deleteProductImage');

const getAllUsers = require('../apis/users/getAllUsers');
const getUserById = require('../apis/users/getUserById');
const putUser = require('../apis/users/putUser');
const putUserAdmin = require('../apis/users/putUserAdmin');
const deleteUser = require('../apis/users/deleteUser');

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

  {
    method: 'GET',
    path: /^\/api\/users\/(\d+)$/,
    handler: withAuth(
      or(
        and(requireRole(1), requireValidatedUser),
        and(
          requireOwnership((req) => parseInt(req.params[0], 10)),
          requireValidatedUser
        )
      )((req, res) => getUserById(req, res, req.params[0]))
    )
  },

  {
    method: 'PUT',
    path: /^\/api\/users\/(\d+)$/,
    handler: withAuth(
      or(
        and(requireRole(1), requireValidatedUser),
        and(
          requireOwnership((req) => parseInt(req.params[0], 10)),
          requireValidatedUser
        )
      )((req, res) => putUser(req, res, req.params[0]))
    )
  },

  {
    method: 'PUT',
    path: /^\/api\/admin\/users\/(\d+)$/,
    handler: withAuth(
      and(requireRole(1), requireValidatedUser)(
        (req, res) => putUserAdmin(req, res, req.params[0])
      )
    )
  },

  {
    method: 'DELETE',
    path: /^\/api\/users\/(\d+)$/,
    handler: withAuth(
      or(
        and(requireRole(1), requireValidatedUser),
        and(
          requireOwnership((req) => parseInt(req.params[0], 10)),
          requireValidatedUser
        )
      )((req, res) => deleteUser(req, res, req.params[0]))
    )
  },

  {
    method: 'GET',
    path: /^\/api\/users$/,
    handler: withAuth(
      and(requireRole(1), requireValidatedUser)(
        getAllUsers
      )
    )
  },
  {
  method: 'POST',
  path: /^\/api\/products\/(\d+)\/images$/,
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
    )((req, res) => postProductImage(req, res, req.params[0]))
  )
},

{
  method: 'PUT',
  path: /^\/api\/products\/images\/(\d+)$/,
  handler: withAuth(
    or(
      and(requireRole(1), requireValidatedUser),
      and(
        requireOwnership(async (req) => {
          const result = await db.query('SELECT p.seller_id FROM product_images i JOIN products p ON i.product_id = p.id WHERE i.id = $1', [req.params[0]]);
          return result.rows[0]?.seller_id ?? null;
        }),
        requireValidatedUser
      )
    )((req, res) => putProductImage(req, res, req.params[0]))
  )
},

{
  method: 'DELETE',
  path: /^\/api\/products\/images\/(\d+)$/,
  handler: withAuth(
    or(
      and(requireRole(1), requireValidatedUser),
      and(
        requireOwnership(async (req) => {
          const result = await db.query('SELECT p.seller_id FROM product_images i JOIN products p ON i.product_id = p.id WHERE i.id = $1', [req.params[0]]);
          return result.rows[0]?.seller_id ?? null;
        }),
        requireValidatedUser
      )
    )((req, res) => deleteProductImage(req, res, req.params[0]))
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