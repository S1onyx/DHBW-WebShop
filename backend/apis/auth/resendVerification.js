const db = require('../../db/database');
const crypto = require('crypto');
const sendMail = require('../../utils/mailer');

async function resendVerification(req, res) {
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

    const { email, username } = data || {};
    const identifier = email || username;

    if (!identifier || typeof identifier !== 'string') {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        error: 'Username or email is required',
        code: 400
      }));
    }

    try {
      const userResult = await db.query(
        `SELECT id, email, status_id FROM users WHERE email = $1 OR username = $1`,
        [identifier]
      );

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

      const link = `http://${process.env.ROOT_URL || 'localhost'}:1337/verify?token=${newToken}`;

      await sendMail({
        to: user.email,
        subject: 'Bestätige erneut deine E-Mail-Adresse',
        html: `
          <div style="font-family:sans-serif;text-align:center">
            <h2>Nochmal bestätigen?</h2>
            <p>Klicke auf den Button, um deinen Account zu verifizieren:</p>
            <a href="${link}" style="display:inline-block;margin-top:16px;padding:12px 24px;background-color:#007bff;color:white;text-decoration:none;border-radius:8px;font-size:16px">Jetzt bestätigen</a>
            <p style="margin-top:24px;font-size:12px;color:#666">Falls der Button nicht funktioniert, nutze diesen Link:<br>${link}</p>
          </div>
        `
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        message: 'Verification link sent again',
        data: { token: newToken }
      }));
    } catch (err) {
      console.error('[RESEND VERIFICATION ERROR]', { input: identifier, error: err });
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Server error during resend', code: 500 }));
    }
  });
}

module.exports = resendVerification;