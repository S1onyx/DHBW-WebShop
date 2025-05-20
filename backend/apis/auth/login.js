const getUserByLogin = require('../../models/users/getUserByLogin');
const bcrypt = require('bcrypt');
const { signAccessToken } = require('../../utils/auth');

async function login(req, res) {
  let body = '';
  req.on('data', chunk => (body += chunk));
  req.on('end', async () => {
    if (!body) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Request body is empty', code: 400 }));
    }

    let credentials;
    try {
      credentials = JSON.parse(body);
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Invalid JSON format', code: 400 }));
    }

    const { email, username, password } = credentials;

    if (!password || (!email && !username)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Username or email and password are required', code: 400 }));
    }

    try {
      const user = await getUserByLogin({ email, username });
      if (!user) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Invalid credentials', code: 401 }));
      }

      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Invalid credentials', code: 401 }));
      }

      if (user.status_id !== 1) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: false,
          error: 'Account not validated',
          retryVerification: true,
          code: 403
        }));
      }

      const accessToken = signAccessToken(user);
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Set-Cookie': [`accessToken=${accessToken}; HttpOnly; Path=/; Max-Age=3600`]
      });
      res.end(JSON.stringify({
        success: true,
        message: 'Login successful',
        data: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      }));
    } catch (err) {
      console.error('[LOGIN ERROR]', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Server error during login', code: 500 }));
    }
  });
}

module.exports = login;