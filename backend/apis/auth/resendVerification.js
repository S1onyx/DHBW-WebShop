const db = require('../../db/database');
const crypto = require('crypto');

async function resendVerification(req, res) {
  let body = '';
  req.on('data', chunk => (body += chunk));
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

    const { email } = data || {};
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Valid email is required', code: 400 }));
    }

    try {
      const userResult = await db.query(`SELECT id, status_id, verification_token FROM users WHERE email = $1`, [email]);

      if (userResult.rowCount === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'User not found', code: 404 }));
      }

      const user = userResult.rows[0];
      if (user.status_id === 1) {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'User already validated', code: 409 }));
      }

      const newToken = crypto.randomBytes(32).toString('hex');
      await db.query(`UPDATE users SET verification_token = $1 WHERE id = $2`, [newToken, user.id]);

      const link = `http://localhost:1337/verify.html?token=${newToken}`;
      console.log(`[DEBUG] Verifikationslink erneut gesendet: ${link}`);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        message: 'Verification link sent again',
        data: { token: newToken }
      }));
    } catch (err) {
      console.error('[RESEND VERIFICATION ERROR]', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Server error during resend', code: 500 }));
    }
  });
}

module.exports = resendVerification;