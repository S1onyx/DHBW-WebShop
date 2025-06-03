// backend/models/users/getMeModel.js
const db = require('../../db/database');

async function getMeModel(userId) {
  const result = await db.query(
    `SELECT
        u.id AS user_id,
        u.first_name,
        u.last_name,
        u.username,
        u.email,
        u.street,
        u.house_number,
        u.postal_code,
        u.city,
        u.country,
        u.role_id,
        r.name AS role,
        u.status_id,
        s.name AS status
     FROM users u
     JOIN roles r ON r.id = u.role_id
     JOIN user_status s ON s.id = u.status_id
     WHERE u.id = $1`,
    [userId]
  );

  return result.rows[0] || null;
}

module.exports = getMeModel;