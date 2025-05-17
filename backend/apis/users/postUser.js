const postUserModel = require('../../models/users/postUserModel');

async function postUser(req, res) {
    if (req.headers['content-type'] !== 'application/json') {
        res.writeHead(415, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Content-Type muss application/json sein.' }));
        return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk; });

    req.on('end', async () => {
        if (!body) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Request-Body darf nicht leer sein.' }));
            return;
        }

        let userData;
        try {
            userData = JSON.parse(body);
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Ungültiges JSON.' }));
            return;
        }

        try {
            const newUser = await postUserModel(userData);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newUser));
        } catch (err) {
            // PostgreSQL unique violation
            if (err.code === '23505') {
                res.writeHead(409, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Benutzername oder E-Mail bereits vergeben.' }));
            } else if (err.message.startsWith('Validierungsfehler')) {
                res.writeHead(422, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            } else {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Serverfehler beim Erstellen des Benutzers.' }));
            }
        }
    });

    req.on('error', () => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Serverfehler.' }));
    });
}

module.exports = postUser;