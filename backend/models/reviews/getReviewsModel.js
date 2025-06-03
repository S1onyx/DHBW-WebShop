const db = require('../../db/database');

async function getReviewsModel(productId) {
  const result = await db.query(
    `SELECT r.id, r.rating, r.comment, r.created_at, u.username AS customer_name
     FROM reviews r
     JOIN users u ON r.customer_id = u.id
     WHERE r.product_id = $1
     ORDER BY r.created_at DESC`,
    [productId]
  );
  return result.rows;
}

module.exports = getReviewsModel;