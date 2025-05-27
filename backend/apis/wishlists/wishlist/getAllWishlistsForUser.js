const { getAllWishlistsForUserModel } = require('../../../models/wishlists/wishlist/getAllWishlistsForUserModel');

async function getAllWishlistsForUser(req, res) {
    try {
        const userId = req.user.userId;
        const wishlists = await getAllWishlistsForUserModel(userId);

        if (!wishlists || wishlists.length === 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'No wishlists found' }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(wishlists));
    } catch (err) {
        console.error('getAllWishlistsForUser Error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server error' }));
    }
}

module.exports = getAllWishlistsForUser;