const db = require('../../db/database');

async function postCartItemModel(cartId, productId, quantity) {
  try {
    // Überprüfen, ob der Warenkorb existiert
    const cartExistsQuery = await db.query(
      `SELECT id FROM carts WHERE id = $1`,
      [cartId]
    );

    if (cartExistsQuery.rows.length === 0) {
      throw new Error('Cart not found');
    }

    // Überprüfen, ob das Produkt existiert
    const productExistsQuery = await db.query(
      `SELECT id FROM products WHERE id = $1`,
      [productId]
    );

    if (productExistsQuery.rows.length === 0) {
      throw new Error('Product not found');
    }

    // Überprüfen, ob das Produkt bereits im Warenkorb existiert
    const existingItemQuery = await db.query(
      `SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2`,
      [cartId, productId]
    );

    if (existingItemQuery.rows.length > 0) {
      // Das Produkt existiert bereits im Warenkorb, Menge erhöhen
      const currentQuantity = parseInt(existingItemQuery.rows[0].quantity, 10);
      const newQuantity = currentQuantity + parseInt(quantity, 10);
      console.log(`Current Quantity: ${currentQuantity}, Quantity to Add: ${quantity}, New Quantity: ${newQuantity}`);
      await db.query(
        `UPDATE cart_items SET quantity = $1 WHERE id = $2`,
        [newQuantity, existingItemQuery.rows[0].id]
      );
      return { itemExists: true, itemId: existingItemQuery.rows[0].id, newQuantity: newQuantity };
    }

    // Erstellen eines neuen Warenkorb-Artikels
    const newItemQuery = await db.query(
      `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING id`,
      [cartId, productId, quantity]
    );

    return { itemExists: false, itemId: newItemQuery.rows[0].id, newQuantity: parseInt(quantity) };
  } catch (err) {
    console.error('Error adding cart item:', err);
    throw err;
  }
}

module.exports = postCartItemModel;