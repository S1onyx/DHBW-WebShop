// backend/apis/users/getAllUsers.js
const getAllUsersModel = require('../../models/users/getAllUsersModel');

async function getAllUsers(req, res) {
  try {
    const users = await getAllUsersModel();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: users
    }));
  } catch (err) {
    console.error('[GET ALL USERS ERROR]', { error: err });
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: 'Server error while fetching users',
      code: 500
    }));
  }
}

module.exports = getAllUsers;