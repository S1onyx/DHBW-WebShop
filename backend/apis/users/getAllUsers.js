// backend/apis/users/getAllUsers.js
const getAllUsersModel = require('../../models/users/getAllUsersModel');

async function getAllUsers(req, res) {
    try {
        const users = await getAllUsersModel();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(users));
    } catch (err) {
        console.error(err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server error' }));
    }
}

module.exports = getAllUsers;
