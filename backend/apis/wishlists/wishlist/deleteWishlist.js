const deleteWishlistModel = require('../../../models/wishlists/wishlist/deleteWishlistModel');

async function deleteWishlist(req, res) {
    const match = req.url.match(/^\/api\/wishlists\/wishlist\/(\d+)$/);
    const wishlist_id = match ? match[1] : null;
    const user_id = req.user.userId;

    if (!wishlist_id) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'wishlist_id is required' }));
    }

    try {
        const result = await deleteWishlistModel(wishlist_id, user_id);

        res.writeHead(result.status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
    } catch (err) {
        console.error('deleteWishlist Error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: false,
            error: 'Server error during deleteWishlist',
            code: 500
        }));
    }
}

module.exports = deleteWishlist;