const db = require('../../../db/database');

async function getAllWishlistsForUserModel(user_id) {
    const query = `
        SELECT
            w.id AS wishlist_id,
            w.name AS wishlist_name,
            CASE
                WHEN w.customer_id = $1 THEN 0
                ELSE p.permission
                END AS permission_id,
            w.customer_id AS owner_id,
            CONCAT(u.first_name, ' ', u.last_name) AS owner_name,
            COALESCE(SUM(pr.price * wi.quantity), 0) AS total_value,
            COUNT(DISTINCT wi.product_id) AS different_products_count
        FROM wishlists w
                 LEFT JOIN wishlist_permission p ON p.wishlist_id = w.id AND p.user_id = $1
                 JOIN users u ON u.id = w.customer_id
                 LEFT JOIN wishlist_items wi ON wi.wishlist_id = w.id
                 LEFT JOIN products pr ON pr.id = wi.product_id
        WHERE w.customer_id = $1 OR p.user_id = $1
        GROUP BY w.id, w.name, permission_id, w.customer_id, owner_name
        ORDER BY permission_id ASC, w.id ASC
    `;

    const result = await db.query(query, [user_id]);
    return result.rows;
}

module.exports = {
    getAllWishlistsForUserModel
};