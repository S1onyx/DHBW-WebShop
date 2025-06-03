// backend/apis/categories/getAllCategories.js
const getAllCategoriesModel = require('../../models/categories/getAllCategoriesModel');

async function getAllCategories(req, res) {
  try {
    const data = await getAllCategoriesModel();

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, code: 200, data }));
  } catch (err) {
    console.error('[GET ALL CATEGORIES ERROR]', { error: err });
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Server error', code: 500 }));
  }
}

module.exports = getAllCategories;