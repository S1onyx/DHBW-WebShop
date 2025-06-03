// backend/apis/users/getMe.js
const getMeModel = require('../../models/users/getMeModel');

async function getMe(req, res) {
  try {
    const userId = req.user.userId;

    const user = await getMeModel(userId);

    if (!user) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'User not found', code: 404 }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, data: user }));
  } catch (err) {
    console.error('[GET ME ERROR]', { userId: req.user?.userId, error: err });
    res.writeHead(500, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: false, error: 'Server error while fetching user', code: 500 }));
  }
}

module.exports = getMe;