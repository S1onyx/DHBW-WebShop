// backend/apis/auth/requestReset.js
const db = require('../../db/database');
const crypto = require('crypto');

async function requestReset(req, res) {
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

    const { email } = data;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Valid email is required', code: 400 }));
    }

    try {
      const result = await db.query(`SELECT id, status_id FROM users WHERE email = $1`, [email]);

      if (result.rowCount === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'User not found', code: 404 }));
      }

      const user = result.rows[0];
      if (user.status_id !== 1) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Account not validated', code: 403 }));
      }

      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 3600000); // 1 Stunde

      await db.query(
        `UPDATE users
         SET reset_token = $1, reset_expires = $2
         WHERE email = $3`,
        [token, expiresAt, email]
      );

      const link = `http://localhost:1337/reset.html?token=${token}`;
      console.log(`[DEBUG] Reset-Link für ${email}: ${link}`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Reset link sent (simuliert)',
        data: { token }
      }));
    } catch (err) {
      console.error('[RESET REQUEST ERROR]', {
        email,
        error: err
      });
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Server error during reset request', code: 500 }));
    }
  });
}

module.exports = requestReset;