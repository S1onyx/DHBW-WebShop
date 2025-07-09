// backend/apis/auth/registerAdmin.js
const db = require('../../db/database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const sendMail = require('../../utils/mailer');

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isSecurePassword = (pw) => typeof pw === 'string' && pw.length >= 8;

async function registerAdmin(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    let data;
    try {
      data = JSON.parse(body);
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Invalid JSON format', code: 400 }));
    }

    const {
      first_name, last_name, username, email, password,
      street, house_number, postal_code, city, country,
      role_id
    } = data;

    if (!first_name || !last_name || !username || !email || !password ||
        !street || !house_number || !postal_code || !city || !country || !role_id) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Missing required fields', code: 400 }));
    }

    if (!isValidEmail(email)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Invalid email format', code: 400 }));
    }

    if (!isSecurePassword(password)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Password must be at least 8 characters', code: 400 }));
    }

    const parsedRole = parseInt(role_id, 10);
    if (![1, 2, 3].includes(parsedRole)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Invalid role_id', code: 400 }));
    }

    try {
      const emailCheck = await db.query('SELECT 1 FROM users WHERE email = $1', [email]);
      if (emailCheck.rowCount > 0) {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Email already registered', code: 409 }));
      }

      const usernameCheck = await db.query('SELECT 1 FROM users WHERE username = $1', [username]);
      if (usernameCheck.rowCount > 0) {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Username already taken', code: 409 }));
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomBytes(32).toString('hex');

      await db.query(`
        INSERT INTO users (
          first_name, last_name, username, email, password_hash,
          role_id, status_id, street, house_number, postal_code, city, country,
          verification_token
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, 2, $7, $8, $9, $10, $11,
          $12
        )
      `, [
        first_name, last_name, username, email, passwordHash,
        parsedRole, street, house_number, postal_code, city, country,
        verificationToken
      ]);

      const verifyUrl = `http://${process.env.ROOT_URL || 'localhost'}:1337/verify?token=${verificationToken}`;
      const roleLabel = { 1: 'Admin', 2: 'Seller', 3: 'Customer' }[parsedRole] || 'Unbekannt';

    const html = `
    <div style="font-family:sans-serif; text-align:center">
        <h2>Willkommen im DHBW WebShop, ${first_name}! 🎉</h2>
        <p>Dein Account mit der Rolle <strong>${roleLabel}</strong> wurde erfolgreich erstellt.</p>
        <p>Klicke auf den Button, um deine E-Mail-Adresse zu bestätigen:</p>
        <a href="${verifyUrl}" style="display:inline-block;margin-top:16px;padding:12px 24px;background-color:#4CAF50;color:white;text-decoration:none;border-radius:8px;font-size:16px">
        E-Mail bestätigen
        </a>
        <p style="margin-top:24px;font-size:12px;color:#666">
        Falls der Button nicht funktioniert, nutze diesen Link:<br/>
        <a href="${verifyUrl}" style="color:#4CAF50">${verifyUrl}</a>
        </p>
        <p style="margin-top:32px">Vielen Dank und viel Spaß beim Shoppen!</p>
    </div>
    `;

      await sendMail({
        to: email,
        subject: 'Bitte bestätigen Sie Ihre E-Mail-Adresse',
        html
      });

      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'User created. Verification email sent.' }));
    } catch (err) {
      console.error('[REGISTER ADMIN ERROR]', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Server error during registration', code: 500 }));
    }
  });
}

module.exports = registerAdmin;