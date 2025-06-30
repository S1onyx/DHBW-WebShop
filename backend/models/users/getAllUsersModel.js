// backend/models/users/getAllUsersModel.js
const db = require('../../db/database');

async function getAllUsersModel(roleId = null) {
  let query = `
    SELECT
      u.id,
      u.first_name,
      u.last_name,
      u.username,
      u.email,
      u.street,
      u.house_number,
      u.postal_code,
      u.city,
      u.country,
      r.name AS role
    FROM users u
    JOIN roles r ON u.role_id = r.id
  `;

  const params = [];

  if (roleId !== null) {
    query += ` WHERE u.role_id = $1`;
    params.push(roleId);
  }

  const result = await db.query(query, params);
  return result.rows;
}

module.exports = getAllUsersModel;