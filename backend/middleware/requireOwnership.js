// backend/middleware/requireOwnership.js
function requireOwnership(getOwnerId) {
  return function (handler) {
    return async (req, res) => {
      if (!req.user) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Authentication required', code: 401 }));
      }

      try {
        const ownerId = await getOwnerId(req);

        if (ownerId === null) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'Resource not found', code: 404 }));
        }

        if (req.user.userId !== ownerId && req.user.roleId !== 1) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'Access denied – not the owner', code: 403 }));
        }

        return handler(req, res);
      } catch (err) {
        console.error('[REQUIRE OWNERSHIP ERROR]', {
          userId: req.user?.userId,
          error: err
        });
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Server error in ownership check', code: 500 }));
      }
    };
  };
}

module.exports = requireOwnership;