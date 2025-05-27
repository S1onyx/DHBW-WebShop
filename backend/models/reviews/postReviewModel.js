const db = require('../../db/database');

async function postReviewModel(customerId, productId, rating, comment) {
  const result = await db.query(
    `INSERT INTO reviews (customer_id, product_id, rating, comment)
     VALUES ($1, $2, $3, $4)
     RETURNING id, rating, comment, created_at`,
    [customerId, productId, rating, comment]
  );
  return result.rows[0];
}

module.exports = postReviewModel;