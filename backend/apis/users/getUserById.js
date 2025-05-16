const getUserByIdModel = require('../../models/users/getUserByIdModel');

async function getUserById(req, res, id) {
  try {
    const user = await getUserByIdModel(id);
    if (!user) {
      res.writeHead(404);
      return res.end(JSON.stringify({ error: 'User not found' }));
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(user));
  } catch (err) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'Server error' }));
  }
}

module.exports = getUserById;