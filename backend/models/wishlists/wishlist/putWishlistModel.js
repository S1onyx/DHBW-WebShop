const db = require('../../../db/database');

async function putWishlistModel(wishlistId, userId, newName) {
    const query = `
        UPDATE wishlists
        SET name = $1
        WHERE id = $2 AND customer_id = $3
        RETURNING id, name, customer_id
    `;

    const result = await db.query(query, [newName, wishlistId, userId]);

    if (result.rowCount === 0) {
        throw new Error('Wishlist not found');
    }

    return result.rows[0];
}

module.exports = {
    putWishlistModel
};
