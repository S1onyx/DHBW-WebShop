const db = require('../../db/database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const sendMail = require('../../utils/mailer');

function isSecurePassword(password) {
  return (
    typeof password === 'string' &&
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

async function register(req, res) {
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

    const {
      first_name, last_name, username, email,
      password, street, house_number, postal_code,
      city, country
    } = data;

    const required = [first_name, last_name, username, email, password, street, house_number, postal_code, city, country];
    if (required.some(v => !v)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Missing required fields', code: 400 }));
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Invalid email format', code: 400 }));
    }

    if (!isSecurePassword(password)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        error: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.',
        code: 400
      }));
    }

    try {
      const hash = await bcrypt.hash(password, 10);
      const token = crypto.randomBytes(32).toString('hex');

      const result = await db.query(`
        INSERT INTO users (
          first_name, last_name, username, email, password_hash, role_id, status_id,
          street, house_number, postal_code, city, country, verification_token
        )
        VALUES ($1,$2,$3,$4,$5,3,2,$6,$7,$8,$9,$10,$11)
        RETURNING id
      `, [
        first_name, last_name, username, email, hash,
        street, house_number, postal_code, city, country, token
      ]);

      const verificationLink = `http://${process.env.ROOT_URL || 'localhost'}:1337/verify?token=${token}`;

      await sendMail({
        to: email,
        subject: 'Bitte bestätige deine Registrierung',
        html: `
          <div style="font-family:sans-serif;text-align:center">
            <h2>Willkommen im DHBW WebShop! 🎉</h2>
            <p>Klicke auf den Button, um deine Registrierung abzuschließen:</p>
            <a href="${verificationLink}" style="display:inline-block;margin-top:16px;padding:12px 24px;background-color:#4CAF50;color:white;text-decoration:none;border-radius:8px;font-size:16px">Jetzt bestätigen</a>
            <p style="margin-top:24px;font-size:12px;color:#666">Falls der Button nicht funktioniert, nutze diesen Link:<br>${verificationLink}</p>
          </div>
        `
      });

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'User registered. Verification email sent.',
        data: { verificationToken: token }
      }));
    } catch (err) {
      console.error('[REGISTER ERROR]', { input: { username, email }, error: err });
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Registration failed', code: 500 }));
    }
  });
}

module.exports = register;