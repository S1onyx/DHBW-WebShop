const { postWishlistModel } = require('../../../models/wishlists/wishlist/postWishlistModel');

async function postWishlist(req, res) {
    try {
        // Request-Body manuell einlesen
        const body = await new Promise((resolve, reject) => {
            let data = '';
            req.on('data', chunk => data += chunk);
            req.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (err) {
                    reject(new Error('Invalid JSON'));
                }
            });
            req.on('error', err => reject(err));
        });

        const { name } = body;
        const userId = req.user.userId;

        if (!name || typeof name !== 'string' || name.trim() === '') {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Wishlist name is required and must be a non-empty string.' }));
        }

        const newWishlist = await postWishlistModel(userId, name.trim());

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newWishlist));

    } catch (err) {
        console.error('postWishlist Error:', err);

        if (err.message === 'Invalid JSON') {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Invalid JSON in request body.' }));
        }

        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server error' }));
    }
}

module.exports = postWishlist;
