const db = require('../../db/database');

async function getUserByIdModel(id) {
  const result = await db.query(
    `SELECT
        u.first_name,
        u.last_name,
        u.username,
        u.email,
        u.street,
        u.house_number,
        u.postal_code,
        u.city,
        u.country,
        r.name AS role,
        s.name AS status
     FROM users u
     JOIN roles r ON r.id = u.role_id
     JOIN user_status s ON s.id = u.status_id
     WHERE u.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

module.exports = getUserByIdModel;