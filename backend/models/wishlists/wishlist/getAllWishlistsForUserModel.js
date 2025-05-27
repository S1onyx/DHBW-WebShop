const db = require('../../../db/database');

async function getAllWishlistsForUserModel(user_id) {
    const query = `
        SELECT w.id AS wishlist_id,
               w.name AS wishlist_name,
               CASE
                   WHEN w.customer_id = $1 THEN 0
                   ELSE p.permission
                   END AS permission_id
        FROM wishlists w
                 LEFT JOIN wishlist_permission p ON p.wishlist_id = w.id AND p.user_id = $1
        WHERE w.customer_id = $1 OR p.user_id = $1
        ORDER BY w.id
    `;
    const result = await db.query(query, [user_id]);
    return result.rows;
}

module.exports = {
    getAllWishlistsForUserModel
};
