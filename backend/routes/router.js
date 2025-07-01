const withAuth = require('../middleware/withAuth');
const requireRole = require('../middleware/requireRole');
const requireOwnership = require('../middleware/requireOwnership');
const requireValidatedUser = require('../middleware/requireValidatedUser');
const requireInvolvedSeller = require('../middleware/requireInvolvedSeller');
const { or, and } = require('../middleware/combine');

const db = require('../db/database');

//permission
const checkPermission = require('../apis/evaluator/checkPermission');

// Auth APIs
const login = require('../apis/auth/login');
const logout = require('../apis/auth/logout');
const register = require('../apis/auth/register');
const verify = require('../apis/auth/verify');
const requestReset = require('../apis/auth/requestReset');
const resetPassword = require('../apis/auth/resetPassword');
const resendVerification = require('../apis/auth/resendVerification');
const loginWithCode = require('../apis/auth/loginWithCode');
const requestLoginCode = require('../apis/auth/requestLoginCode');
const checkEmail = require('../apis/auth/checkEmail');
const checkUsername = require('../apis/auth/checkUsername');

// Category APIs
const getCategoryWithChildren = require('../apis/categories/getCategoryWithChildren');
const getAllCategories = require('../apis/categories/getAllCategories')

// Product APIs
const getAllProducts = require('../apis/products/getAllProducts');
const getProductById = require('../apis/products/getProductById');
const putProduct = require('../apis/products/putProduct');
const deleteProduct = require('../apis/products/deleteProduct');
const postProduct = require('../apis/products/postProduct')
const deleteWishlistPermission = require('../apis/wishlists/permissions/deletePermission');
const getMyProducts = require('../apis/products/getMyProducts');

// ProductImage APIs
const postProductImage = require('../apis/products/images/postProductImage');
const putProductImage = require('../apis/products/images/putProductImage');
const deleteProductImage = require('../apis/products/images/deleteProductImage');

// User APIs
const getMe = require('../apis/users/getMe');
const getAllUsers = require('../apis/users/getAllUsers');
const getUserById = require('../apis/users/getUserById');
const putUser = require('../apis/users/putUser');
const putUserAdmin = require('../apis/users/putUserAdmin');
const deleteUser = require('../apis/users/deleteUser');

const getWishlistItems = require('../apis/wishlists/items/getWishlistItems');
const postWishlistItem = require('../apis/wishlists/items/postWishlistItem');
const putWishlistItem = require('../apis/wishlists/items/putWishlistItem');
const deleteWishlistItem = require('../apis/wishlists/items/deleteWishlistItem');

// Order APIs
const getOrders = require('../apis/orders/getOrders');
const postOrder = require('../apis/orders/postOrder');
const putOrder = require('../apis/orders/putOrder');

// Review APIs
const getReviews = require('../apis/reviews/getReviews');
const postReview = require('../apis/reviews/postReview');
const putReview = require('../apis/reviews/putReview');
const deleteReview = require('../apis/reviews/deleteReview');

// Cart APIs
const postCart = require('../apis/cart/postCart');
const postCartItem = require('../apis/cart/postCartItem');
const getCart = require('../apis/cart/getCart');
const deleteCartItem = require('../apis/cart/deleteCartItem');
const deleteCart = require('../apis/cart/deleteCart');
const putQuantity = require('../apis/cart/putQuantity');

// WishlistPermission APIs
const getWishlistPermissions = require('../apis/wishlists/permissions/getPermissions');
const postWishlistPermission = require('../apis/wishlists/permissions/postPermission');
const putWishlistPermission = require('../apis/wishlists/permissions/putPermission');

// Wishlist APIs
const getAllWishlistsForUser = require('../apis/wishlists/wishlist/getAllWishlistsForUser');
const postWishlist = require('../apis/wishlists/wishlist/postWishlist');
const putWishlist = require('../apis/wishlists/wishlist/putWishlist');
const deleteWishlist = require('../apis/wishlists/wishlist/deleteWishlist');

const { handleCorsPreflight, setCorsHeaders } = require('../utils/cors');

const routes = [

  {
  method: 'GET',
  path: /^\/api\/evaluator$/,
  handler: withAuth(
    and(requireRole(1), requireValidatedUser)(
      checkPermission
    )
  )
},
  // Auth Routes
  { method: 'POST', path: /^\/api\/auth\/login$/, handler: login },
  { method: 'POST', path: /^\/api\/auth\/logout$/, handler: logout },
  { method: 'POST', path: /^\/api\/auth\/register$/, handler: register },
  { method: 'POST', path: /^\/api\/auth\/verify$/, handler: verify },
  { method: 'POST', path: /^\/api\/auth\/request-reset$/, handler: requestReset },
  { method: 'POST', path: /^\/api\/auth\/reset$/, handler: resetPassword },
  { method: 'POST', path: /^\/api\/auth\/resend-verification$/, handler: resendVerification },
  { method: 'POST', path: /^\/api\/auth\/request-login-code$/, handler: requestLoginCode },
  { method: 'POST', path: /^\/api\/auth\/login-with-code$/, handler: loginWithCode },
  { method: 'GET', path: /^\/api\/auth\/check-email$/, handler: checkEmail },
  { method: 'GET', path: /^\/api\/auth\/check-username$/, handler: checkUsername },

{
  method: 'GET',
  path: /^\/api\/categories$/,
  handler: (req, res) => getAllCategories(req, res)
},

{
  method: 'GET',
  path: /^\/api\/categories\/(\d+)\/with-children$/,
  handler: (req, res, params) => getCategoryWithChildren(req, res, params[0])
},

  // Product Routes
  {
  method: 'GET',
  path: /^\/api\/products\/mine$/,
  handler: withAuth(
    and(requireRole(2), requireValidatedUser)(getMyProducts)
  )
},
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

  // Product Image Routes
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
  },

  // User Routes
  {
    method: 'POST',
    path: /^\/api\/products$/,
    handler: withAuth(
      and(
        requireRole(1, 2),
        requireValidatedUser
       )(require('../apis/products/postProduct'))
    )
  },

  {
  method: 'GET',
  path: /^\/api\/users\/me$/,
  handler: withAuth(
    requireValidatedUser(
      getMe
    )
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
  },

  {
    method: 'GET',
    path: /^\/api\/products\/(\d+)\/reviews$/,
    handler: (req, res) => getReviews(req, res, req.params[0])
  },

  {
    method: 'POST',
    path: /^\/api\/products\/(\d+)\/reviews$/,
    handler: withAuth(
      requireValidatedUser((req, res) => postReview(req, res, req.params[0]))
    )
  },

  {
  method: 'PUT',
  path: /^\/api\/reviews\/(\d+)$/,
  handler: withAuth(
    or(
      and(requireRole(1), requireValidatedUser),
      and(
        requireOwnership(async (req) => {
          const result = await db.query('SELECT customer_id FROM reviews WHERE id = $1', [req.params[0]]);
          return result.rows[0]?.customer_id ?? null;
        }),
        requireValidatedUser
      )
    )((req, res) => putReview(req, res, req.params[0]))
  )
},

{
  method: 'DELETE',
  path: /^\/api\/reviews\/(\d+)$/,
  handler: withAuth(
    or(
      and(requireRole(1), requireValidatedUser),
      and(
        requireOwnership(async (req) => {
          const result = await db.query('SELECT customer_id FROM reviews WHERE id = $1', [req.params[0]]);
          return result.rows[0]?.customer_id ?? null;
        }),
        requireValidatedUser
      ),
      and(
        requireOwnership(async (req) => {
          const result = await db.query('SELECT p.seller_id FROM reviews r JOIN products p ON p.id = r.product_id WHERE r.id = $1', [req.params[0]]);
          return result.rows[0]?.seller_id ?? null;
        }),
        requireValidatedUser
      )
    )((req, res) => deleteReview(req, res, req.params[0]))
  )
},

{
  method: 'GET',
  path: /^\/api\/orders$/,
  handler: withAuth(
    and(requireValidatedUser)(
      (req, res) => getOrders(req, res)
    )
  )
},

{
  method: 'POST',
  path: /^\/api\/orders$/,
  handler: withAuth(
    and(requireValidatedUser, requireRole(3))(
      postOrder
    )
  )
},

{
  method: 'PUT',
  path: /^\/api\/orders\/(\d+)$/,
  handler: withAuth(
    or(
      and(requireRole(1), requireValidatedUser),
      and(requireRole(2), requireInvolvedSeller(), requireValidatedUser)
    )((req, res) => putOrder(req, res, req.params[0]))
  )
},
  
  // Cart Routes
  {
    method: 'GET',
    path: /^\/api\/carts$/,
    handler: withAuth(
      and(requireRole(3), requireValidatedUser)(
        (req, res) => getCart(req, res)
      )
    )
  },
  {
    method: 'POST',
    path: /^\/api\/carts$/,
    handler: withAuth(
      and(requireRole(3), requireValidatedUser)(
        (req, res) => postCart(req, res)
      )
    )
  },
  {
    method: 'DELETE',
    path: /^\/api\/carts$/,
    handler: withAuth(
      and(requireRole(3), requireValidatedUser)(
        (req, res) => deleteCart(req, res)
      )
    )
  },
  {
    method: 'POST',
    path: /^\/api\/carts\/items$/,
    handler: withAuth(
      and(requireRole(3), requireValidatedUser)(
        (req, res) => postCartItem(req, res)
      )
    )
  },
  {
    method: 'DELETE',
    path: /^\/api\/carts\/items$/,
    handler: withAuth(
      and(requireRole(3), requireValidatedUser)(
        (req, res) => deleteCartItem(req, res)
      )
    )
  },
  {
    method: 'PUT',
    path: /^\/api\/carts\/items$/,
    handler: withAuth(
      and(requireRole(3), requireValidatedUser)(
        (req, res) => putQuantity(req, res)
      )
    )
  },

{
  method: 'GET',
  path: /^\/api\/wishlists\/(\d+)\/permissions$/,
  handler: withAuth(
    and(
      requireOwnership(async (req) => {
        const result = await db.query(
          'SELECT customer_id FROM wishlists WHERE id = $1',
          [req.params[0]]
        );
        return result.rows[0]?.customer_id ?? null;
      }),
      requireValidatedUser
    )((req, res) => getWishlistPermissions(req, res, req.params[0]))
  )
},

{
  method: 'POST',
  path: /^\/api\/wishlists\/(\d+)\/permissions$/,
  handler: withAuth(
    and(
      requireOwnership(async (req) => {
        const result = await db.query(
          'SELECT customer_id FROM wishlists WHERE id = $1',
          [req.params[0]]
        );
        return result.rows[0]?.customer_id ?? null;
      }),
      requireValidatedUser
    )((req, res) => postWishlistPermission(req, res, req.params[0]))
  )
},

{
  method: 'PUT',
  path: /^\/api\/wishlists\/(\d+)\/permissions$/,
  handler: withAuth(
    and(
      requireOwnership(async (req) => {
        const result = await db.query(
          'SELECT customer_id FROM wishlists WHERE id = $1',
          [req.params[0]]
        );
        return result.rows[0]?.customer_id ?? null;
      }),
      requireValidatedUser
    )((req, res) => putWishlistPermission(req, res, req.params[0]))
  )
},

{
  method: 'DELETE',
  path: /^\/api\/wishlists\/(\d+)\/permissions$/,
  handler: withAuth(
    and(
      requireOwnership(async (req) => {
        const result = await db.query(
          'SELECT customer_id FROM wishlists WHERE id = $1',
          [req.params[0]]
        );
        return result.rows[0]?.customer_id ?? null;
      }),
      requireValidatedUser
    )((req, res) => deleteWishlistPermission(req, res, req.params[0]))
  )
},

{
  method: 'GET',
  path: /^\/api\/wishlists\/(\d+)\/items$/,
  handler: withAuth(
    requireValidatedUser(
      (req, res) => getWishlistItems(req, res, parseInt(req.params[0], 10))
    )
  )
},

{
  method: 'POST',
  path: /^\/api\/wishlists\/(\d+)\/items$/,
  handler: withAuth(
    requireValidatedUser(
      (req, res) => postWishlistItem(req, res, parseInt(req.params[0], 10))
    )
  )
},

{
  method: 'PUT',
  path: /^\/api\/wishlists\/(\d+)\/items$/,
  handler: withAuth(
    requireValidatedUser(
      (req, res) => putWishlistItem(req, res, parseInt(req.params[0], 10))
    )
  )
},

{
  method: 'DELETE',
  path: /^\/api\/wishlists\/(\d+)\/items$/,
  handler: withAuth(
    requireValidatedUser(
      (req, res) => deleteWishlistItem(req, res, parseInt(req.params[0], 10))
    )
  )
},

// Wishlist Routes
  {
    method: 'GET',
    path: /^\/api\/wishlists\/wishlist$/,
    handler: withAuth(
        requireValidatedUser(
            (req, res) => getAllWishlistsForUser(req, res)
        )
    )
  },
  {
    method: 'POST',
    path: /^\/api\/wishlists\/wishlist$/,
    handler: withAuth(
        requireValidatedUser(
            (req, res) => postWishlist(req, res)
        )
    )
  },
  {
    method: 'PUT',
    path: /^\/api\/wishlists\/wishlist\/(\d+)$/,
    handler: withAuth(
      or(
        requireRole(1),
        and(
          requireOwnership(async (req) => {
            const result = await db.query(
              'SELECT customer_id FROM wishlists WHERE id = $1',
              [req.params[0]]
            );
            return result.rows[0]?.customer_id ?? null;
          }),
          requireValidatedUser
        )
      )(
        (req, res) => putWishlist(req, res)
      )
    )
  },
  {
    method: 'DELETE',
    path: /^\/api\/wishlists\/wishlist\/(\d+)$/,
    handler: withAuth(
        requireValidatedUser(
            (req, res) => deleteWishlist(req, res)
        )
    )
  }
];

module.exports = async function router(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  req.query = url.searchParams;
  req.params = [];

  if (handleCorsPreflight(req, res)) return;

  setCorsHeaders(res);

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
