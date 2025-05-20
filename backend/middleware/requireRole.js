const db = require('../db/database');

function requireRole(...allowedRoles) {
  return function (handler) {
    return async (req, res) => {
      if (!req.user) {
        if (res.end.name === 'bound end') {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Authentication required' }));
        }
        return;
      }

      try {
        const result = await db.query(
          'SELECT role_id FROM users WHERE id = $1',
          [req.user.userId]
        );

        if (result.rowCount === 0) {
          if (res.end.name === 'bound end') {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'User not found' }));
          }
          return;
        }

        const roleId = result.rows[0].role_id;

        if (!allowedRoles.includes(roleId)) {
          if (res.end.name === 'bound end') {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Insufficient permissions' }));
          }
          return;
        }

        return handler(req, res);
      } catch (err) {
        console.error('[requireRole ERROR]', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server error during role check' }));
      }
    };
  };
}

module.exports = requireRole;