const db = require('../../db/database');

async function postCartModel(userId) {
  try {
    // Überprüfen, ob bereits ein Warenkorb für den Benutzer existiert
    const existingCartQuery = await db.query(
      `SELECT id FROM carts WHERE customer_id = $1`,
      [userId]
    );

    if (existingCartQuery.rows.length > 0) {
      // Es existiert bereits ein Warenkorb für diesen Benutzer
      return { cartExists: true, cartId: existingCartQuery.rows[0].id };
    }

    // Erstellen eines neuen Warenkorbs
    const newCartQuery = await db.query(
      `INSERT INTO carts (customer_id) VALUES ($1) RETURNING id`,
      [userId]
    );

    return { cartExists: false, cartId: newCartQuery.rows[0].id };
  } catch (err) {
    console.error('Error creating cart:', err);
    throw err;
  }
}

module.exports = postCartModel;