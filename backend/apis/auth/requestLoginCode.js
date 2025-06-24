// backend/apis/auth/requestLoginCode.js
const db = require('../../db/database');
const sendMail = require('../../utils/mailer');

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function requestLoginCode(req, res) {
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
    if (!email || typeof email !== 'string') {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Email is required', code: 400 }));
    }

    try {
      const result = await db.query('SELECT id, first_name, status_id FROM users WHERE email = $1', [email]);

      if (result.rowCount === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'User not found', code: 404 }));
      }

      const user = result.rows[0];
      if (user.status_id !== 1) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Account not validated', code: 403 }));
      }

      const code = generateCode();
      const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 Minuten

      await db.query(
        'UPDATE users SET login_code = $1, login_code_expires = $2 WHERE email = $3',
        [code, expires, email]
      );

      const loginLink = `http://${process.env.ROOT_URL || 'localhost'}:1337/login-code?email=${encodeURIComponent(email)}&code=${code}`;

      await sendMail({
        to: email,
        subject: 'Dein Login-Code',
        html: `
          <div style="font-family:sans-serif;text-align:center">
            <h2>🔐 Login-Code angefordert</h2>
            <p>Dein persönlicher Login-Code lautet:</p>
            <p style="font-size:24px;font-weight:bold;margin:16px 0">${code}</p>
            <p>Oder nutze diesen Link zum direkten Login:</p>
            <a href="${loginLink}" style="display:inline-block;margin-top:16px;padding:12px 24px;background-color:#4CAF50;color:white;text-decoration:none;border-radius:8px;font-size:16px">Jetzt einloggen</a>
            <p style="margin-top:24px;font-size:12px;color:#666">Gültig für 5 Minuten</p>
          </div>
        `
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Login code sent' }));
    } catch (err) {
      console.error('[REQUEST LOGIN CODE ERROR]', { email, error: err });
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Server error during code request', code: 500 }));
    }
  });
}

module.exports = requestLoginCode;