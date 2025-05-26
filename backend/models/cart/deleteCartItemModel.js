const db = require('../../db/database');

async function deleteCartItemModel(itemId, userId) {
  // Prüfen, ob das Item zum Warenkorb des Users gehört
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

  // Item löschen
  await db.query(
    `DELETE FROM cart_items WHERE id = $1`,
    [itemId]
  );

  return { deletedItemId: itemId };
}

module.exports = deleteCartItemModel;
