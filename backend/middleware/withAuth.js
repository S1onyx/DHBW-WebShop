// backend/middleware/withAuth.js
const { verifyAccessToken } = require('../utils/auth');
const db = require('../db/database');

function withAuth(handler) {
  return async (req, res) => {
    const cookie = req.headers.cookie || '';
    const match = cookie.match(/accessToken=([^;]+)/);
    const token = match && match[1];

    if (!token) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Authentication required', code: 401 }));
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Invalid or expired token', code: 401 }));
    }

    try {
      const result = await db.query('SELECT role_id FROM users WHERE id = $1', [payload.userId]);

      if (result.rowCount === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'User not found', code: 404 }));
      }

      req.user = {
        userId: payload.userId,
        roleId: result.rows[0].role_id,
      };

      return handler(req, res);
    } catch (err) {
      console.error('[WITH AUTH ERROR]', {
        tokenPayload: payload,
        error: err,
      });

      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Server error during authentication', code: 500 }));
    }
  };
}

module.exports = withAuth;