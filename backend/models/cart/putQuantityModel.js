// models/cart/putCartItemQuantityModel.js
const db = require('../../db/database');

async function putCartItemQuantityModel(cartId, productId, newQuantity) {
  try {
    if (newQuantity < 1) {
      throw new Error('Quantity must be at least 1');
    }

    // Prüfen, ob der Warenkorb existiert
    const cartExists = await db.query(
      `SELECT id FROM carts WHERE id = $1`,
      [cartId]
    );
    if (cartExists.rows.length === 0) {
      throw new Error('Cart not found');
    }

    // Prüfen, ob das Produkt im Warenkorb existiert
    const itemExists = await db.query(
      `SELECT id FROM cart_items WHERE cart_id = $1 AND product_id = $2`,
      [cartId, productId]
    );
    if (itemExists.rows.length === 0) {
      throw new Error('Cart item not found');
    }

    // Menge aktualisieren
    await db.query(
      `UPDATE cart_items SET quantity = $1 WHERE cart_id = $2 AND product_id = $3`,
      [newQuantity, cartId, productId]
    );

    return { updated: true, newQuantity };
  } catch (err) {
    console.error('Error updating cart item quantity:', err);
    throw err;
  }
}

module.exports = putCartItemQuantityModel;
