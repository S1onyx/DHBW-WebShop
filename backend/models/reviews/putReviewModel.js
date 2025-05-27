const db = require('../../db/database');

async function putReviewModel(reviewId, updates) {
  const fields = Object.keys(updates);
  const values = Object.values(updates);

  if (fields.length === 0) return false;

  const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');

  const query = `UPDATE reviews SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`;

  const result = await db.query(query, [...values, reviewId]);
  return result.rows[0] || null;
}

module.exports = putReviewModel;