// backend/models/orders/postOrderModel.js
const db = require('../../db/database');

async function postOrderModel(userId) {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const cartRes = await client.query(
      `SELECT id FROM carts WHERE customer_id = $1`,
      [userId]
    );
    if (cartRes.rowCount === 0) {
      throw { statusCode: 400, message: 'Cart is empty' };
    }
    const cartId = cartRes.rows[0].id;

    const itemsRes = await client.query(
      `SELECT ci.product_id, ci.quantity, p.name, p.stock, p.price
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.cart_id = $1`,
      [cartId]
    );

    const items = itemsRes.rows;
    if (items.length === 0) {
      throw { statusCode: 400, message: 'Cart is empty' };
    }

    // Prüfe Lagerbestand
    const insufficient = items
      .filter(item => item.quantity > item.stock)
      .map(item => ({
        product_id: item.product_id,
        name: item.name,
        requested: item.quantity,
        available: item.stock
      }));

    if (insufficient.length > 0) {
      throw {
        statusCode: 409,
        message: 'Insufficient stock for one or more products',
        details: insufficient
      };
    }

    const totalPrice = items.reduce(
      (sum, item) => sum + item.quantity * parseFloat(item.price),
      0
    );

    const orderRes = await client.query(
      `INSERT INTO orders (customer_id, total_price, status_id)
       VALUES ($1, $2, 1)
       RETURNING id, order_date`,
      [userId, totalPrice]
    );

    const order = orderRes.rows[0];

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.product_id, item.quantity, item.price]
      );

      await client.query(
        `UPDATE products SET stock = stock - $1 WHERE id = $2`,
        [item.quantity, item.product_id]
      );
    }

    await client.query(`DELETE FROM cart_items WHERE cart_id = $1`, [cartId]);

    await client.query('COMMIT');

    return {
      order_id: order.id,
      order_date: order.order_date,
      total_price: totalPrice,
      status: 'Pending',
      items: items.map(item => ({
        product_id: item.product_id,
        name: item.name,
        unit_price: parseFloat(item.price),
        quantity: item.quantity
      }))
    };
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.statusCode === 409 && err.details) {
      throw {
        statusCode: 409,
        message: err.message,
        details: err.details
      };
    }
    throw err;
  } finally {
    client.release();
  }
}

module.exports = postOrderModel;