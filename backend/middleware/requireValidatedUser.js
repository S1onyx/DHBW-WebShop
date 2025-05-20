const db = require('../db/database');

function requireValidatedUser(handler) {
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
        'SELECT status_id FROM users WHERE id = $1',
        [req.user.userId]
      );

      if (result.rowCount === 0) {
        if (res.end.name === 'bound end') {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'User not found' }));
        }
        return;
      }

      const user = result.rows[0];
      if (user.status_id !== 1) {
        if (res.end.name === 'bound end') {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Account not validated' }));
        }
        return;
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