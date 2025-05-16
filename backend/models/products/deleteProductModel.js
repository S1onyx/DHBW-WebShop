const db = require('../../db/database');

async function deleteProductModel(id) {
    const result = await db.query(
        'DELETE FROM products WHERE id = $1 RETURNING *',
        [id]
    );
    return result.rowCount > 0;
}

module.exports = deleteProductModel;
