// models/cart/deleteCartModel.js
const db = require('../../db/database');

async function deleteCartModel(cartId) {
  try {
    // Prüfen, ob der Warenkorb existiert
    const cartExistsQuery = await db.query(
      `SELECT id FROM carts WHERE id = $1`,
      [cartId]
    );

    if (cartExistsQuery.rows.length === 0) {
      throw new Error('Cart not found');
    }

    // Zuerst alle zugehörigen cart_items löschen (wegen FK constraints)
    await db.query(
      `DELETE FROM cart_items WHERE cart_id = $1`,
      [cartId]
    );

    // Dann den Warenkorb selbst löschen
    await db.query(
      `DELETE FROM carts WHERE id = $1`,
      [cartId]
    );

    return { deleted: true };
  } catch (err) {
    console.error('Error deleting cart:', err);
    throw err;
  }
}

module.exports = deleteCartModel;
