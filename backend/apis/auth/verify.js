const db = require('../../db/database');

async function verify(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get('token');

  if (!token) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: false, error: 'Missing token', code: 400 }));
  }

  try {
    const result = await db.query(
      `UPDATE users
       SET status_id = 1, verification_token = NULL
       WHERE verification_token = $1
       RETURNING id`,
      [token]
    );

    if (result.rowCount === 0) {
      res.writeHead(409, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Token invalid or already used', code: 409 }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Account verified successfully' }));
  } catch (err) {
    console.error('[VERIFY ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Server error during verification', code: 500 }));
  }
}

module.exports = verify;