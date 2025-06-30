const db = require('../../db/database');

async function checkEmail(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const email = url.searchParams.get('email');

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: false, error: 'Valid email required', code: 400 }));
  }

  try {
    const result = await db.query('SELECT 1 FROM users WHERE email = $1 LIMIT 1', [email]);
    const exists = result.rowCount > 0;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, exists }));
  } catch (err) {
    console.error('[CHECK EMAIL ERROR]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Server error during email check', code: 500 }));
  }
}

module.exports = checkEmail;