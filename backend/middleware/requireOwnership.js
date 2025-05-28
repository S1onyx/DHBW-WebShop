module.exports = function requireOwnership(getOwnerIdFn) {
  return async function (req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Authentication required', code: 401 });
      }

      const ownerId = await getOwnerIdFn(req);
      if (ownerId === null) {
        return res.status(404).json({ success: false, error: 'Resource not found', code: 404 });
      }

      if (req.user.userId !== ownerId && req.user.roleId !== 1) {
        return res.status(403).json({ success: false, error: 'Access denied – not the owner', code: 403 });
      }

      next();
    } catch (err) {
      console.error('[REQUIRE OWNERSHIP ERROR]', err);
      next(err);
    }
  };
};