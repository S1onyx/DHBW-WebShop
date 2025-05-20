const putUserModel = require('../../models/users/putUserModel');

async function putUser(req, res, id) {
    try {
        const userId = parseInt(id, 10);
        if (isNaN(userId)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Invalid user ID' }));
        }

        const body = await new Promise((resolve, reject) => {
            let data = '';
            req.on('data', chunk => {
                data += chunk;
            });
            req.on('end', () => resolve(data));
            req.on('error', err => reject(err));
        });

        const userData = JSON.parse(body);
        const updatedUser = await putUserModel(userId, userData);

        if (!updatedUser) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'User not found' }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(updatedUser));
    } catch (err) {
        console.error(err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server error' }));
    }
}

module.exports = putUser;