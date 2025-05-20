const db = require('../../db/database');

async function deleteCartItemModel(cartId, productId) {
  try {
    // Prüfen, ob der Warenkorb existiert
    const cartExistsQuery = await db.query(
      `SELECT id FROM carts WHERE id = $1`,
      [cartId]
    );

    if (cartExistsQuery.rows.length === 0) {
      throw new Error('Cart not found');
    }

    // Prüfen, ob das Item im Warenkorb existiert
    const itemQuery = await db.query(
      `SELECT id FROM cart_items WHERE cart_id = $1 AND product_id = $2`,
      [cartId, productId]
    );

    if (itemQuery.rows.length === 0) {
      throw new Error('Cart item not found');
    }

    // Löschen des Items
    await db.query(
      `DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2`,
      [cartId, productId]
    );

    return { deleted: true };
  } catch (err) {
    console.error('Error deleting cart item:', err);
    throw err;
  }
}

module.exports = deleteCartItemModel;
