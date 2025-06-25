const db = require('../../db/database');

async function getCartModel(userId) {
  // Hole cartId des Users
  const cartIdResult = await db.query(
    `SELECT id FROM carts WHERE customer_id = $1`,
    [userId]
  );

  if (cartIdResult.rows.length === 0) return null;

  const cartId = cartIdResult.rows[0].id;

  // Hole cartDetails
  const cartDetailsQuery = await db.query(
    `SELECT c.id, u.first_name || ' ' || u.last_name AS customer_name
     FROM carts c
     JOIN users u ON c.customer_id = u.id
     WHERE c.id = $1`,
    [cartId]
  );

  // Hole cartItems inkl. Lagerbestand (stock)
  const cartItemsQuery = await db.query(
    `SELECT ci.id, ci.product_id, p.name, p.price, ci.quantity, p.stock
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     WHERE ci.cart_id = $1`,
    [cartId]
  );

  if (cartDetailsQuery.rows.length === 0) return null;

  return {
    cartDetails: cartDetailsQuery.rows[0],
    items: cartItemsQuery.rows,
  };
}

async function byUserId(userId) {
  const cartDetailsQuery = await db.query(
    `SELECT c.id, u.first_name || ' ' || u.last_name AS customer_name
     FROM carts c
     JOIN users u ON c.customer_id = u.id
     WHERE u.id = $1`,
    [userId]
  );

  if (cartDetailsQuery.rows.length === 0) return null;

  const cartId = cartDetailsQuery.rows[0].id;

  const cartItemsQuery = await db.query(
    `SELECT ci.id, ci.product_id, p.name, p.price, ci.quantity, p.stock
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     WHERE ci.cart_id = $1`,
    [cartId]
  );

  return {
    cartDetails: cartDetailsQuery.rows[0],
    items: cartItemsQuery.rows,
  };
}

module.exports = {
  getCartModel,
  byUserId
};