const postUserModel = require('../../models/users/postUserModel');
const { json } = require('stream/consumers');

async function postUser(req, res) {
    try {
        const data = await json(req);

        const requiredFields = [
            'first_name', 'last_name', 'username', 'email',
            'password_hash', 'role_id', 'street', 'house_number',
            'postal_code', 'city', 'country'
        ];

        const missingFields = requiredFields.filter(f => !data[f]);
        if (missingFields.length > 0) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({
                error: 'Missing required fields',
                missing: missingFields
            }));
        }

        const newUser = await postUserModel(data);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ createdId: newUser.id }));

    } catch (err) {
        if (err.code === '23505') {
            if (err.constraint === 'users_username_key') {
                res.writeHead(409, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Username already exists' }));
            }
            if (err.constraint === 'users_email_key') {
                res.writeHead(409, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Email already exists' }));
            }
        }

        if (err instanceof SyntaxError) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Invalid JSON body' }));
        }

        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server error' }));
    }
}

module.exports = postUser;
