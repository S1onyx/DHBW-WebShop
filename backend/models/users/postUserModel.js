const db = require('../../db/database');

async function postUserModel(user) {
    const result = await db.query(
        `INSERT INTO users (
            first_name, last_name, username, email,
            password_hash, role_id, status_id,         
            street, house_number, postal_code, city, country
        )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING id`,
        [
            user.first_name,
            user.last_name,
            user.username,
            user.email,
            user.password_hash,
            user.role_id,
            user.status_id,
            user.street,
            user.house_number,
            user.postal_code,
            user.city,
            user.country
        ]
    );

    return result.rows[0];
}
