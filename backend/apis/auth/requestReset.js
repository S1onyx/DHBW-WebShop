const db = require('../../db/database');
const crypto = require('crypto');
const sendMail = require('../../utils/mailer');

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

    const { email, username } = data;

    if (!email && !username) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Email or username required', code: 400 }));
    }

    let user;
    try {
      let result;

      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        result = await db.query(`SELECT id, email, status_id FROM users WHERE email = $1`, [email]);
      } else if (username) {
        result = await db.query(`SELECT id, email, status_id FROM users WHERE username = $1`, [username]);
      } else {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Invalid email format and no username provided', code: 400 }));
      }

      if (result.rowCount === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'User not found', code: 404 }));
      }

      user = result.rows[0];

      if (user.status_id !== 1) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Account not validated', code: 403 }));
      }

      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 3600000); // 1 Stunde

      await db.query(
        `UPDATE users
         SET reset_token = $1, reset_expires = $2
         WHERE id = $3`,
        [token, expiresAt, user.id]
      );

      const link = `http://localhost:1337/reset.html?token=${token}`;

      await sendMail({
        to: user.email,
        subject: 'Passwort zurücksetzen',
        html: `
          <div style="font-family:sans-serif;text-align:center">
            <h2>Passwort vergessen?</h2>
            <p>Klicke auf den Button, um ein neues Passwort zu setzen:</p>
            <a href="${link}" style="display:inline-block;margin-top:16px;padding:12px 24px;background-color:#f44336;color:white;text-decoration:none;border-radius:8px;font-size:16px">Passwort zurücksetzen</a>
            <p style="margin-top:24px;font-size:12px;color:#666">Falls der Button nicht funktioniert, nutze diesen Link:<br>${link}</p>
          </div>
        `
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Reset link sent.',
        data: { token }
      }));
    } catch (err) {
      console.error('[RESET REQUEST ERROR]', { email, username, error: err });
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Server error during reset request', code: 500 }));
    }
  });
}

module.exports = requestReset;