const db = require('../../db/database');

async function deleteReviewModel(reviewId) {
  const result = await db.query('DELETE FROM reviews WHERE id = $1 RETURNING *', [reviewId]);
  return result.rows[0] || null;
}

module.exports = deleteReviewModel;