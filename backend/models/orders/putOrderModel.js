const db = require('../../db/database');

async function putOrderModel(orderId, newStatusId) {
  // Existiert der Status überhaupt?
  const statusRes = await db.query('SELECT 1 FROM order_status WHERE id = $1', [newStatusId]);
  if (statusRes.rowCount === 0) {
    return 'INVALID_STATUS';
  }

  // Versuch, Bestellung zu aktualisieren
  const result = await db.query(
    `UPDATE orders
     SET status_id = $1
     WHERE id = $2
     RETURNING id`,
    [newStatusId, orderId]
  );

  if (result.rowCount === 0) {
    return 'ORDER_NOT_FOUND';
  }

  return true;
}

module.exports = putOrderModel;