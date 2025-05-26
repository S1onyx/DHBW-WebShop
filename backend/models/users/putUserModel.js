// backend/models/users/putUserModel.js
const db = require('../../db/database');

async function putUserModel(id, updates) {
  const fields = Object.keys(updates);
  const values = Object.values(updates);

  if (fields.length === 0) return false;

  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
  const query = `
    UPDATE users
    SET ${setClause}
    WHERE id = $${fields.length + 1}
  `;

  const result = await db.query(query, [...values, id]);
  return result.rowCount > 0;
}

module.exports = putUserModel;