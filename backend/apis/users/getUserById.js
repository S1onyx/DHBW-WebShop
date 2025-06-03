// backend/apis/users/getUserById.js
const getUserByIdModel = require('../../models/users/getUserByIdModel');

async function getUserById(req, res, id) {
  try {
    const user = await getUserByIdModel(id);

    if (!user) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'User not found', code: 404 }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data: user }));
  } catch (err) {
    console.error('[GET USER BY ID ERROR]', { id, error: err });
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Server error', code: 500 }));
  }
}

module.exports = getUserById;