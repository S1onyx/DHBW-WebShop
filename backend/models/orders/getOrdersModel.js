// backend/models/orders/getOrdersModel.js
const db = require('../../db/database');

async function getOrdersModel({ userId, roleId, productId, status }) {
  if (roleId === 3) {
    const result = await db.query(`
      SELECT o.id AS order_id, o.order_date, o.total_price, s.name AS status,
             json_agg(json_build_object(
               'product_id', p.id,
               'name', p.name,
               'unit_price', oi.unit_price,
               'quantity', oi.quantity
             )) AS items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON p.id = oi.product_id
      JOIN order_status s ON o.status_id = s.id
      WHERE o.customer_id = $1
      GROUP BY o.id, s.name
      ORDER BY o.order_date DESC
    `, [userId]);
    return result.rows;
  }

  if (roleId === 2) {
    const params = [userId];
    let statusFilter = '';

    if (status) {
      const check = await db.query('SELECT 1 FROM order_status WHERE id = $1', [status]);
      if (check.rowCount === 0) throw new Error('INVALID_STATUS');

      params.push(status);
      statusFilter = 'AND o.status_id = $2';
    }

    const result = await db.query(`
      SELECT p.id AS product_id, p.name,
             json_agg(json_build_object(
               'order_date', o.order_date,
               'quantity', oi.quantity,
               'unit_price', oi.unit_price,
               'status', s.name
             ) ORDER BY o.order_date DESC) AS sales
      FROM products p
      JOIN order_items oi ON p.id = oi.product_id
      JOIN orders o ON o.id = oi.order_id
      JOIN order_status s ON o.status_id = s.id
      WHERE p.seller_id = $1 ${statusFilter}
      GROUP BY p.id, p.name
      ORDER BY p.name
    `, params);
    return result.rows;
  }

  if (roleId === 1 && productId) {
    const result = await db.query(`
      SELECT p.id AS product_id, p.name,
             json_agg(json_build_object(
               'order_date', o.order_date,
               'quantity', oi.quantity,
               'unit_price', oi.unit_price,
               'status', s.name
             ) ORDER BY o.order_date DESC) AS sales
      FROM products p
      JOIN order_items oi ON p.id = oi.product_id
      JOIN orders o ON o.id = oi.order_id
      JOIN order_status s ON o.status_id = s.id
      WHERE p.id = $1
      GROUP BY p.id, p.name
    `, [productId]);
    return result.rows;
  }

  return [];
}

module.exports = getOrdersModel;