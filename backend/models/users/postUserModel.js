const db = require('../../db/database');

function validateUserData(userData) {
    const requiredFields = ['first_name', 'last_name', 'username', 'email', 'street', 'house_number', 'postal_code', 'city', 'country', 'role_id'];
    const errors = [];

    requiredFields.forEach(field => {
        if (!userData[field]) {
            errors.push(`${field} ist erforderlich.`);
        }
    });

    if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
        errors.push('Ungültige E-Mail-Adresse.');
    }

    if (userData.role_id && typeof userData.role_id !== 'number') {
        errors.push('role_id muss eine Zahl sein.');
    }

    return errors;
}

async function postUserModel(userData) {
    const validationErrors = validateUserData(userData);
    if (validationErrors.length > 0) {
        throw new Error(`Validierungsfehler: ${validationErrors.join(', ')}`);
    }

    const { first_name, last_name, username, email, password_hash ,street, house_number, postal_code, city, country, role_id } = userData;

    const query = `
    INSERT INTO users (first_name, last_name, username, email, password_hash, street, house_number, postal_code, city, country, role_id)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING id, first_name, last_name, username, email, password_hash, street, house_number, postal_code, city, country, role_id
`;

    const values = [first_name, last_name, username, email, password_hash, street, house_number, postal_code, city, country, role_id];


    try {
        const result = await db.query(query, values);
        return result.rows[0];
    } catch (err) {
        console.error('Database error:', err.message);
        throw new Error('Fehler beim Erstellen des Benutzers in der Datenbank.');
    }
}

module.exports = postUserModel;