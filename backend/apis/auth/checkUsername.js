const db = require('../../db/database');

async function checkUsername(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const username = url.searchParams.get('username');

  if (!username || username.length < 3) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: false, error: 'Valid username required', code: 400 }));
  }

  try {
    const result = await db.query('SELECT 1 FROM users WHERE username = $1 LIMIT 1', [username]);
    const exists = result.rowCount > 0;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, exists }));
  } catch (err) {
    console.error('[CHECK USERNAME ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Server error during username check', code: 500 }));
  }
}

module.exports = checkUsername;