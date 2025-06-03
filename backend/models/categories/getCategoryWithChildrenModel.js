// backend/models/categories/getCategoryWithChildren.js
const db = require('../../db/database');

async function getCategoryWithChildrenModel(categoryId) {
  const result = await db.query(
    'SELECT id, name FROM categories WHERE id = $1',
    [categoryId]
  );

  if (result.rowCount === 0) return null;

  const root = result.rows[0];
  const visited = new Set();
  const allChildIds = [];

  async function fetchChildren(parentId) {
    const res = await db.query(
      'SELECT id, name FROM categories WHERE parent_id = $1',
      [parentId]
    );

    const children = [];

    for (const row of res.rows) {
      if (!visited.has(row.id)) {
        visited.add(row.id);
        allChildIds.push(row.id);
        const grandChildren = await fetchChildren(row.id);
        children.push({
          id: row.id,
          name: row.name,
          children: grandChildren
        });
      }
    }

    return children;
  }

  const children = await fetchChildren(categoryId);

  return {
    id: root.id,
    name: root.name,
    children,
    allChildIds
  };
}

module.exports = getCategoryWithChildrenModel;