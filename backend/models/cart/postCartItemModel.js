const db = require('../../db/database');

async function postCartItemModel(cartId, productId, quantity) {
  try {
    // Prüfen, ob der Warenkorb existiert
    const cartExistsQuery = await db.query(
      `SELECT id FROM carts WHERE id = $1`,
      [cartId]
    );
    if (cartExistsQuery.rows.length === 0) {
      throw new Error('Cart not found');
    }

    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }

    // Prüfen, ob das Produkt existiert
    const productExistsQuery = await db.query(
      `SELECT id FROM products WHERE id = $1`,
      [productId]
    );
    if (productExistsQuery.rows.length === 0) {
      throw new Error('Product not found');
    }

    // Prüfen, ob das Produkt schon im Warenkorb ist
    const existingItemQuery = await db.query(
      `SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2`,
      [cartId, productId]
    );

    if (existingItemQuery.rows.length > 0) {
      // Produkt existiert schon -> Menge erhöhen
      const currentQuantity = parseInt(existingItemQuery.rows[0].quantity, 10);
      const newQuantity = currentQuantity + parseInt(quantity, 10);

      await db.query(
        `UPDATE cart_items SET quantity = $1 WHERE id = $2`,
        [newQuantity, existingItemQuery.rows[0].id]
      );

      return { itemExists: true, itemId: existingItemQuery.rows[0].id, newQuantity };
    }

    // Produkt noch nicht im Warenkorb -> neuen Eintrag anlegen
    const newItemQuery = await db.query(
      `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING id`,
      [cartId, productId, quantity]
    );

    return { itemExists: false, itemId: newItemQuery.rows[0].id, newQuantity: parseInt(quantity, 10) };

  } catch (err) {
    console.error('Error adding cart item:', err);
    throw err;
  }
}

module.exports = postCartItemModel;
