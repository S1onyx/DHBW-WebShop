// backend/middleware/requireRole.js
const db = require('../db/database');

function requireRole(...allowedRoles) {
  return function (handler) {
    return async (req, res) => {
      if (!req.user) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Authentication required', code: 401 }));
      }

      try {
        const result = await db.query(
          'SELECT role_id FROM users WHERE id = $1',
          [req.user.userId]
        );

        if (result.rowCount === 0) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'User not found', code: 404 }));
        }

        const roleId = result.rows[0].role_id;

        if (!allowedRoles.includes(roleId)) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'Insufficient permissions', code: 403 }));
        }

        return handler(req, res);
      } catch (err) {
        console.error('[REQUIRE ROLE ERROR]', { userId: req.user?.userId, error: err });
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Server error during role check', code: 500 }));
      }
    };
  };
}

module.exports = requireRole;