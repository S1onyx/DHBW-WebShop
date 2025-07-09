const db = require('../../db/database');

async function getOrdersModel({ userId, roleId, productId, status }) {
  const result = { rows: [], filteredOut: false };

if (roleId === 3) {
  const values = [userId];
  let baseQuery = `
    SELECT o.id AS order_id, o.order_date, o.total_price, s.name AS status,
           json_agg(json_build_object(
             'product_id', p.id,
             'name', p.name,
             'unit_price', oi.unit_price,
             'quantity', oi.quantity
           )) AS items
    FROM orders o
    JOIN order_items oi ON o.id = oi.id
    JOIN products p ON p.id = oi.product_id
    JOIN order_status s ON o.status_id = s.id
    WHERE o.customer_id = $1
  `;

  if (status) {
    // Optionaler Statusfilter
    const check = await db.query('SELECT 1 FROM order_status WHERE id = $1', [status]);
    if (check.rowCount === 0) throw new Error('INVALID_STATUS');

    values.push(status);
    baseQuery += ` AND o.status_id = $2`;
  }

  baseQuery += ` GROUP BY o.id, s.name ORDER BY o.order_date DESC`;

  const res = await db.query(baseQuery, values);
  result.rows = res.rows;

  if (status && res.rowCount === 0) {
    // Wenn Statusfilter nichts zurückgibt, prüfe ohne Status erneut
    const resAll = await db.query(baseQuery.replace(` AND o.status_id = $2`, ''), [userId]);
    if (resAll.rowCount > 0) result.filteredOut = true;
  }

  return result;
}

  if (roleId === 2) {
    const params = [userId];
    let statusFilter = '';

    if (status) {
      const check = await db.query('SELECT 1 FROM order_status WHERE id = $1', [status]);
      if (check.rowCount === 0) throw new Error('INVALID_STATUS');
      statusFilter = 'AND o.status_id = $2';
      params.push(status);
    }

    const baseQuery = `
      SELECT p.id AS product_id, p.name,
             json_agg(json_build_object(
               'order_date', o.order_date,
               'order_id', o.id,
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
    `;

    const res = await db.query(baseQuery, params);
    result.rows = res.rows;

    if (status && res.rowCount === 0) {
      const resAll = await db.query(baseQuery.replace('AND o.status_id = $2', ''), [userId]);
      if (resAll.rowCount > 0) result.filteredOut = true;
    }

    return result;
  }

  if (roleId === 1 && productId) {
    const params = [productId];
    const baseQuery = `
      SELECT p.id AS product_id, p.name,
             json_agg(json_build_object(
               'order_date', o.order_date,
               'order_id', o.id,
               'quantity', oi.quantity,
               'unit_price', oi.unit_price,
               'status', s.name
             ) ORDER BY o.order_date DESC) AS sales
      FROM products p
      JOIN order_items oi ON p.id = oi.product_id
      JOIN orders o ON o.id = oi.order_id
      JOIN order_status s ON o.status_id = s.id
      WHERE p.id = $1 ${status ? 'AND o.status_id = $2' : ''}
      GROUP BY p.id, p.name
    `;

    if (status) {
      const check = await db.query('SELECT 1 FROM order_status WHERE id = $1', [status]);
      if (check.rowCount === 0) throw new Error('INVALID_STATUS');
      params.push(status);
    }

    const res = await db.query(baseQuery, params);
    result.rows = res.rows;

    if (status && res.rowCount === 0) {
      const resAll = await db.query(baseQuery.replace('AND o.status_id = $2', ''), [productId]);
      if (resAll.rowCount > 0) result.filteredOut = true;
    }

    return result;
  }

  return result;
}

module.exports = getOrdersModel;