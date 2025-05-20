const db = require('../../db/database');

async function deleteUserModel(id) {
    const query = `
        DELETE FROM users
        WHERE id = $1
            RETURNING *;
    `;

    const values = [
        id
    ];

    const result = await db.query(query, values);
    return result.rows[0];
}
module.exports = deleteUserModel;