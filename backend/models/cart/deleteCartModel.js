const db = require('../../db/database');

async function deleteCartModel(userId) {
  try {
    // Hole die cartId zu diesem Benutzer
    const cartQuery = await db.query(
      `SELECT id FROM carts WHERE customer_id = $1`,
      [userId]
    );

    if (cartQuery.rows.length === 0) {
      throw new Error('Cart not found');
    }

    const cartId = cartQuery.rows[0].id;

    // Cart-Items löschen (FK constraints!)
    await db.query(`DELETE FROM cart_items WHERE cart_id = $1`, [cartId]);

    // Cart löschen
    await db.query(`DELETE FROM carts WHERE id = $1`, [cartId]);

    return { deleted: true };
  } catch (err) {
    console.error('Error deleting cart:', err);
    throw err;
  }
}

module.exports = deleteCartModel;
