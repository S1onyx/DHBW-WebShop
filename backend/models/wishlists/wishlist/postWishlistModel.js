const db = require('../../../db/database');

async function postWishlistModel(userId, wishlistName) {
    const query = `
        INSERT INTO wishlists (name, customer_id)
        VALUES ($1, $2)
        RETURNING id, name, customer_id
    `;

    const result = await db.query(query, [wishlistName, userId]);
    return result.rows[0];
}

module.exports = {
    postWishlistModel
};
