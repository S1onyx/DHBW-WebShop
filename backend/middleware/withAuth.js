// backend/middleware/withAuth.js
const { verifyAccessToken } = require('../utils/auth');

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

    req.user = {
      userId: payload.userId,
      roleId: payload.roleId,
    };

    return handler(req, res);
  };
}

module.exports = withAuth;