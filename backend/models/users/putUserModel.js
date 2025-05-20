const db = require('../../db/database');

async function putUserModel(id, user) {
    const query = `
        UPDATE users
        SET first_name = $1,
            last_name = $2,
            username = $3,
            email = $4,
            street = $5,
            house_number = $6,
            postal_code = $7,
            city = $8,
            country = $9
        WHERE id = $10
            RETURNING *;
    `;

    const values = [
        user.first_name,
        user.last_name,
        user.username,
        user.email,
        user.street,
        user.house_number,
        user.postal_code,
        user.city,
        user.country,
        id
    ];

    const result = await db.query(query, values);
    return result.rows[0];
}

module.exports = putUserModel;
