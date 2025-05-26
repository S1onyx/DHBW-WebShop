const db = require('../../db/database');

async function putQuantityModel(itemId, quantity, userId) {
  // Prüfen, ob der Artikel zum Warenkorb des Users gehört
  const itemQuery = await db.query(
    `SELECT ci.id
     FROM cart_items ci
     JOIN carts c ON ci.cart_id = c.id
     WHERE ci.id = $1 AND c.customer_id = $2`,
    [itemId, userId]
  );

  if (itemQuery.rows.length === 0) {
    throw new Error('Cart item not found');
  }

  // Menge aktualisieren
  await db.query(
    `UPDATE cart_items SET quantity = $1 WHERE id = $2`,
    [quantity, itemId]
  );

  return { itemId, newQuantity: quantity };
}

module.exports = putQuantityModel;
