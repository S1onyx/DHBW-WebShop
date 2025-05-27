// backend/models/wishlists/permissions/getPermissionsModel.js
const db = require('../../../db/database');

async function getPermissionsForWishlist(wishlistId) {
  const id = parseInt(wishlistId, 10);
  if (isNaN(id)) return null;

  // Hole Owner
  const ownerResult = await db.query(
    `SELECT w.id, w.name, u.id AS user_id, u.username
     FROM wishlists w
     JOIN users u ON w.customer_id = u.id
     WHERE w.id = $1`,
    [id]
  );

  if (ownerResult.rowCount === 0) return null;

  const wishlist = {
    id: ownerResult.rows[0].id,
    name: ownerResult.rows[0].name
  };

  const owner = {
    user_id: ownerResult.rows[0].user_id,
    username: ownerResult.rows[0].username,
    permission: 0
  };

  // Hole Permissions
  const permissionResult = await db.query(
    `SELECT u.id AS user_id, u.username, p.id AS permission
     FROM wishlist_permission wp
     JOIN users u ON wp.user_id = u.id
     JOIN permission p ON wp.permission = p.id
     WHERE wp.wishlist_id = $1`,
    [id]
  );

  const writer = [];
  const readOnly = [];

  for (const row of permissionResult.rows) {
    const entry = {
      user_id: row.user_id,
      username: row.username,
      permission: row.permission
    };
    if (row.permission === 2) {
      writer.push(entry);
    } else if (row.permission === 1) {
      readOnly.push(entry);
    }
  }

  return {
    wishlist,
    permissions: {
      owner: [owner],
      writer,
      readOnly
    }
  };
}

module.exports = getPermissionsForWishlist;