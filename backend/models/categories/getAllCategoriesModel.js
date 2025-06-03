// backend/models/categories/getAllCategories.js
const db = require('../../db/database');

async function getAllCategoriesModel() {
  const result = await db.query('SELECT id, name, parent_id FROM categories');

  const categories = result.rows;
  const map = new Map();

  // Map initialisieren
  for (const category of categories) {
    category.children = [];
    map.set(category.id, category);
  }

  const tree = [];

  for (const category of categories) {
    if (category.parent_id) {
      const parent = map.get(category.parent_id);
      if (parent) {
        parent.children.push(category);
      }
    } else {
      tree.push(category);
    }
  }

  // Rekursiv sortieren
  function sortRecursive(list) {
    list.sort((a, b) => a.name.localeCompare(b.name));
    for (const cat of list) {
      if (cat.children?.length) {
        sortRecursive(cat.children);
      }
    }
  }

  sortRecursive(tree);
  return tree;
}

module.exports = getAllCategoriesModel;