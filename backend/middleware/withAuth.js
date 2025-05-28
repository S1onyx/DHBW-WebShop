const jwt = require('jsonwebtoken');
const db = require('../../db');

module.exports = async function withAuth(req, res, next) {
  try {
    const token = req.cookies?.accessToken;
    if (!token) {
      return res.status(401).json({ success: false, error: 'Authentication required', code: 401 });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const result = await db.query('SELECT role_id, status_id FROM users WHERE id = $1', [payload.userId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'User not found', code: 404 });
    }

    req.user = {
      userId: payload.userId,
      roleId: result.rows[0].role_id,
      statusId: result.rows[0].status_id
    };
    next();
  } catch (err) {
    console.error('[WITH AUTH ERROR]', err);
    return res.status(401).json({ success: false, error: 'Invalid or expired token', code: 401 });
  }
};