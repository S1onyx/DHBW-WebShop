const { verifyAccessToken } = require('../utils/auth');

function withAuth(handler) {
  return async (req, res) => {
    const cookie = req.headers.cookie || '';
    const match = cookie.match(/accessToken=([^;]+)/);
    const token = match && match[1];

    if (!token) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Authentication required' }));
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Invalid or expired token' }));
    }

    req.user = {
      userId: payload.userId,
      roleId: payload.roleId,
    };

    return handler(req, res);
  };
}

module.exports = withAuth;