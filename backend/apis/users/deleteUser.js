// backend/apis/users/deleteUser.js
const deleteUserModel = require('../../models/users/deleteUserModel');

async function deleteUser(req, res, id) {
  try {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        error: 'Invalid user ID',
        code: 400
      }));
    }

    const deletedUser = await deleteUserModel(userId);

    if (!deletedUser) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: false,
        error: 'User not found',
        code: 404
      }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'User deleted',
      data: { deletedId: userId }
    }));
  } catch (err) {
    console.error('[DELETE USER ERROR]', { error: err });
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: 'Server error during deletion',
      code: 500
    }));
  }
}

module.exports = deleteUser;