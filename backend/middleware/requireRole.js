module.exports = function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.roleId)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions', code: 403 });
    }
    next();
  };
};