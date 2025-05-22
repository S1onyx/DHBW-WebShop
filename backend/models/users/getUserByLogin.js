const db = require('../../db/database');

async function getUserByLogin({ email, username }) {
  if (!email && !username) return null;

  const result = await db.query(
    `SELECT id, username, email, password_hash, role_id, status_id
     FROM users
     WHERE ${email ? 'email = $1' : 'username = $1'}
     LIMIT 1`,
    [email || username]
  );

  return result.rows[0] || null;
}

module.exports = getUserByLogin;