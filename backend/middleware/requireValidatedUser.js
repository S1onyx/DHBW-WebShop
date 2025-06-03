// backend/middleware/requireValidatedUser.js
const db = require('../db/database');

function requireValidatedUser(handler) {
  return async (req, res) => {
    if (!req.user) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Authentication required', code: 401 }));
    }

    try {
      const result = await db.query(
        'SELECT status_id FROM users WHERE id = $1',
        [req.user.userId]
      );

      if (result.rowCount === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'User not found', code: 404 }));
      }

      const user = result.rows[0];
      if (user.status_id !== 1) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Account not validated', code: 403 }));
      }

      return handler(req, res);
    } catch (err) {
      console.error('[REQUIRE VALIDATED USER ERROR]', {
        userId: req.user?.userId,
        error: err
      });
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Server error during status check', code: 500 }));
    }
  };
}

module.exports = requireValidatedUser;