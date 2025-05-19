const db = require('../../db/database');

async function getCartModel(cartId) {
  // Abfrage, um die Cart-Items abzurufen
  const cartItemsQuery = await db.query(
    `SELECT ci.id, ci.product_id, p.name, p.price, ci.quantity
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     WHERE ci.cart_id = $1`,
    [cartId]
  );

  // Abfrage, um die Cart-Details abzurufen
  const cartDetailsQuery = await db.query(
    `SELECT c.id, u.first_name || ' ' || u.last_name AS customer_name
     FROM carts c
     JOIN users u ON c.customer_id = u.id
     WHERE c.id = $1`,
    [cartId]
  );

  //Prüfe, ob cart existiert
  if (cartDetailsQuery.rows.length === 0) return null;

  //Gibt die cart und cart item details aus
  return {
    cartDetails: cartDetailsQuery.rows[0],
    items: cartItemsQuery.rows,
  };
}

module.exports = getCartModel;