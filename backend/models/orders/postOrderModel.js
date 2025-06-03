// backend/models/orders/postOrderModel.js
const db = require('../../db/database');
const sendMail = require('../../utils/mailer');
const { generateOrderConfirmationEmail, generateSellerNotificationEmail } = require('../../utils/orderEmailTemplates');

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
      `SELECT ci.product_id, ci.quantity, p.name, p.stock, p.price, p.seller_id, img.url
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       LEFT JOIN LATERAL (
         SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1
       ) img ON true
       WHERE ci.cart_id = $1`,
      [cartId]
    );

    const items = itemsRes.rows;
    if (items.length === 0) {
      throw { statusCode: 400, message: 'Cart is empty' };
    }

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

    // E-Mail Versand
    try {
      const userQuery = await db.query(`
        SELECT first_name, last_name, email, street, house_number, postal_code, city, country
        FROM users WHERE id = $1`, [userId]);
      const customer = userQuery.rows[0];

      const orderData = {
        orderId: order.id,
        orderDate: order.order_date,
        customer,
        items,
        totalPrice
      };

      const customerMail = generateOrderConfirmationEmail(orderData);
      await sendMail(customerMail);

      const sellerMap = new Map();

      for (const item of items) {
        const key = item.seller_id;
        if (!sellerMap.has(key)) sellerMap.set(key, []);
        sellerMap.get(key).push(item);
      }

      for (const [sellerId, sellerItems] of sellerMap) {
        const sellerRes = await db.query(`SELECT email, first_name FROM users WHERE id = $1`, [sellerId]);
        if (sellerRes.rowCount === 0) continue;
        const seller = sellerRes.rows[0];
        const sellerMail = generateSellerNotificationEmail({
          seller,
          orderId: order.id,
          orderDate: order.order_date,
          items: sellerItems
        });
        await sendMail(sellerMail);
      }
    } catch (mailErr) {
      console.error('[ORDER MAIL ERROR]', mailErr);
    }

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