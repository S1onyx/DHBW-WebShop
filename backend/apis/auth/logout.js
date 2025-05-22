// backend/apis/auth/logout.js
function logout(req, res) {
  try {
    res.writeHead(200, {
      'Set-Cookie': [
        'accessToken=; HttpOnly; Path=/; Max-Age=0'
      ],
      'Content-Type': 'application/json'
    });

    res.end(JSON.stringify({ success: true, message: 'Logged out' }));
  } catch (err) {
    console.error('[LOGOUT ERROR]', {
      url: req.url,
      ip: req.socket?.remoteAddress,
      error: err
    });

    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Server error during logout', code: 500 }));
  }
}

module.exports = logout;