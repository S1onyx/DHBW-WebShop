const db = require('../db/database');

async function getAll() {
  const result = await db.query('SELECT * FROM products');
  return result.rows;
}

module.exports = {
  getAll,
};