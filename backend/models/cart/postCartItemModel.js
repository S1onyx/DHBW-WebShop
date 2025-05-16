const db = require('../../db/database');

async function postCartItemModel(cartId, productId, quantity) {
  try {
    // Überprüfen, ob das Produkt bereits im Warenkorb existiert
    const existingItemQuery = await db.query(
      `SELECT id FROM cart_items WHERE cart_id = $1 AND product_id = $2`,
      [cartId, productId]
    );

    if (existingItemQuery.rows.length > 0) {
      // Das Produkt existiert bereits im Warenkorb
      return { itemExists: true, itemId: existingItemQuery.rows[0].id };
    }

    // Erstellen eines neuen Warenkorb-Artikels
    const newItemQuery = await db.query(
      `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING id`,
      [cartId, productId, quantity]
    );

    return { itemExists: false, itemId: newItemQuery.rows[0].id };
  } catch (err) {
    console.error('Error adding cart item:', err);
    throw err;
  }
}

module.exports = postCartItemModel;