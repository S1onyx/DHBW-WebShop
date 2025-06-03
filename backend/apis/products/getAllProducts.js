// backend/apis/products/getAllProducts.js
const getAllProductsModel = require('../../models/products/getAllProductsModel');
const getCategoryWithChildren = require('../../models/categories/getCategoryWithChildrenModel');

async function getAllProducts(req, res, params) {
  try {
const sort = params.get('sort');
const order = params.get('order');

const filters = {
  minPrice: params.get('minPrice'),
  maxPrice: params.get('maxPrice'),
  name: params.get('name'),
  stockOnly: params.get('inStock') === 'true',
  sortBy: ['price', 'name', 'rating'].includes(sort) ? sort : null,
  sortOrder: order === 'desc' ? 'desc' : 'asc'
};

    const categoryId = params.get('category');
    let categoryInfo = null;

    if (categoryId) {
      const parsedId = parseInt(categoryId, 10);
      if (isNaN(parsedId)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Invalid category ID', code: 400 }));
      }

      const category = await getCategoryWithChildren(parsedId);
      if (!category) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Category not found', code: 404 }));
      }

      filters.categoryIds = [parsedId, ...category.allChildIds];
      categoryInfo = {
        id: category.id,
        name: category.name,
        children: category.children
      };
    }

    const products = await getAllProductsModel(filters);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: products,
      ...(categoryInfo ? { category: categoryInfo } : {})
    }));
  } catch (err) {
    console.error('[GET ALL PRODUCTS ERROR]', { error: err });
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Server error', code: 500 }));
  }
}

module.exports = getAllProducts;