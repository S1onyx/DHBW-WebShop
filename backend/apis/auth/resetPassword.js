// backend/apis/auth/resetPassword.js
const db = require('../../db/database');
const bcrypt = require('bcrypt');

async function resetPassword(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get('token');

  if (!token) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: false, error: 'Missing token', code: 400 }));
  }

  let body = '';
  let bodySize = 0;
  const MAX_BODY_SIZE = 1e6;

  req.on('data', chunk => {
    bodySize += chunk.length;
    if (bodySize > MAX_BODY_SIZE) {
      res.writeHead(413, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Payload too large', code: 413 }));
    }
    body += chunk;
  });

  req.on('end', async () => {
    if (!body) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Request body is empty', code: 400 }));
    }

    let data;
    try {
      data = JSON.parse(body);
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Invalid JSON format', code: 400 }));
    }

    const { newPassword } = data;
    if (
      !newPassword ||
      newPassword.length < 8 ||
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/\d/.test(newPassword) ||
      !/[^A-Za-z0-9]/.test(newPassword)
    ) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        error: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.',
        code: 400
      }));
    }

    try {
      const hash = await bcrypt.hash(newPassword, 10);
      const result = await db.query(
        `UPDATE users
         SET password_hash = $1, reset_token = NULL, reset_expires = NULL
         WHERE reset_token = $2 AND reset_expires > CURRENT_TIMESTAMP
         RETURNING id`,
        [hash, token]
      );

      if (result.rowCount === 0) {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Invalid or expired token', code: 409 }));
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Password reset successful' }));
    } catch (err) {
      console.error('[RESET ERROR]', {
        token,
        error: err
      });
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Server error during password reset', code: 500 }));
    }
  });
}

module.exports = resetPassword;