const db = require('../../db/database');
const { signAccessToken } = require('../../utils/auth');

async function loginWithCode(req, res) {
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

    const { email, code } = data;
    if (!email || !code) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Email and code required', code: 400 }));
    }

    try {
      const result = await db.query(
        'SELECT id, username, role_id, status_id, login_code, login_code_expires FROM users WHERE email = $1',
        [email]
      );

      if (result.rowCount === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'User not found', code: 404 }));
      }

      const user = result.rows[0];
      const now = new Date();

      if (!user.login_code || user.login_code !== code || !user.login_code_expires || new Date(user.login_code_expires) < now) {
        res.writeHead(409, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Invalid or expired code', code: 409 }));
      }

      if (user.status_id !== 1) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Account not validated', code: 403 }));
      }

      await db.query('UPDATE users SET login_code = NULL, login_code_expires = NULL WHERE id = $1', [user.id]);

      const accessToken = signAccessToken(user);
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Set-Cookie': [`accessToken=${accessToken}; HttpOnly; Path=/; Max-Age=3600`]
      });
      res.end(JSON.stringify({
        success: true,
        message: 'Login with code successful',
        data: {
          id: user.id,
          username: user.username,
          role_id: user.role_id
        }
      }));
    } catch (err) {
      console.error('[LOGIN WITH CODE ERROR]', { email, code, error: err });
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Server error during code login', code: 500 }));
    }
  });
}

module.exports = loginWithCode;