const getCategoryWithChildrenModel = require('../../models/categories/getCategoryWithChildrenModel');

async function getCategoryWithChildren(req, res, categoryId) {
  try {
    const id = parseInt(categoryId, 10);
    if (isNaN(id)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Invalid category ID', code: 400 }));
    }

    const data = await getCategoryWithChildrenModel(id);

    if (!data) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Category not found', code: 404 }));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, code: 200, data }));
  } catch (err) {
    console.error('[GET CATEGORY WITH CHILDREN ERROR]', { error: err });
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Server error', code: 500 }));
  }
}

module.exports = getCategoryWithChildren;