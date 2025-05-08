const db = require('../db/database');

async function getAll() {
  const result = await db.query('SELECT * FROM products WHERE id = 1');
  return result.rows;
}

module.exports = {
  getAll,
};