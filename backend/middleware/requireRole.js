function requireRole(...allowedRoles) {
  return function (handler) {
    return async (req, res) => {
      if (!req.user) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Authentication required' }));
      }

      if (!allowedRoles.includes(req.user.roleId)) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Insufficient permissions' }));
      }

      return handler(req, res);
    };
  };
}

module.exports = requireRole;