// backend/models/products/putProductModel.js
const db = require('../../db/database');

async function putProductModel(id, updates) {
  const fields = Object.keys(updates);
  const values = Object.values(updates);

  if (fields.length === 0) return false;

  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');

  const query = `
    UPDATE products
    SET ${setClause}
    WHERE id = $${fields.length + 1}
  `;

  const result = await db.query(query, [...values, id]);
  return result.rowCount > 0;
}

module.exports = putProductModel;