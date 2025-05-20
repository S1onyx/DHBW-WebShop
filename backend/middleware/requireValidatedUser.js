const db = require('../db/database');

function requireValidatedUser(handler) {
  return async (req, res) => {
    if (!req.user) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Authentication required' }));
    }

    try {
      const result = await db.query(
        'SELECT status_id FROM users WHERE id = $1',
        [req.user.userId]
      );

      if (result.rowCount === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'User not found' }));
      }

      const user = result.rows[0];
      if (user.status_id !== 1) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Account not validated' }));
      }

      return handler(req, res);
    } catch (err) {
      console.error(err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Server error during status check' }));
    }
  };
}

module.exports = requireValidatedUser;