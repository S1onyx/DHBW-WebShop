// backend/apis/auth/changePassword.js
const bcrypt = require('bcrypt');
const db = require('../../db/database');

// Lokale Passwort-Validierungsfunktion
function isSecurePassword(password) {
  return typeof password === 'string'
    && password.length >= 8
    && /[A-Z]/.test(password)
    && /[a-z]/.test(password)
    && /[0-9]/.test(password)
    && /[^A-Za-z0-9]/.test(password);
}

async function changePassword(req, res) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    let data;
    try {
      data = JSON.parse(body);
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Invalid JSON format', code: 400 }));
    }

    const { old_password, new_password, confirm_password } = data;

    if (!old_password || !new_password || !confirm_password) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        error: 'All password fields are required',
        code: 400
      }));
    }

    if (new_password !== confirm_password) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        error: 'New password and confirmation do not match',
        code: 400
      }));
    }

    if (!isSecurePassword(new_password)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        error: 'New password does not meet security requirements',
        code: 400
      }));
    }

    if (new_password === old_password) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        error: 'New password must be different from old password',
        code: 400
      }));
    }

    try {
      const userId = req.user.userId;

      const result = await db.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [userId]
      );

      if (result.rowCount === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: false,
          error: 'User not found',
          code: 404
        }));
      }

      const isMatch = await bcrypt.compare(old_password, result.rows[0].password_hash);
      if (!isMatch) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: false,
          error: 'Incorrect old password',
          code: 403
        }));
      }

      const newHash = await bcrypt.hash(new_password, 10);
      await db.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [newHash, userId]
      );

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Password updated successfully'
      }));
    } catch (err) {
      console.error('[CHANGE PASSWORD ERROR]', { error: err });
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: 'Server error during password change',
        code: 500
      }));
    }
  });
}

module.exports = changePassword;