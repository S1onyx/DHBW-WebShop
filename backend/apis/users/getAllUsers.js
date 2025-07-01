const getAllUsersModel = require('../../models/users/getAllUsersModel');

async function getAllUsers(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const roleParam = url.searchParams.get('role');

    let roleId = null;

    if (roleParam !== null) {
      roleId = parseInt(roleParam, 10);
      if (![1, 2, 3].includes(roleId)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          success: false,
          error: 'Invalid role filter. Allowed values: 1, 2, or 3.',
          code: 400
        }));
      }
    }

    const users = await getAllUsersModel(roleId);

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