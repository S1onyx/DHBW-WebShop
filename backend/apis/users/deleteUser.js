const deleteUserModel = require('../../models/users/deleteUserModel');

async function deleteUser(req, res, id) {
    try {
        const userId = parseInt(id, 10);
        if (isNaN(userId)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Invalid user ID' }));
        }

        const deletedUser = await deleteUserModel(userId);

        if (!deletedUser) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'User not found' }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ deletedId: userId }));
    } catch (err) {
        console.error(err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server error' }));
    }
}
module.exports = deleteUser;