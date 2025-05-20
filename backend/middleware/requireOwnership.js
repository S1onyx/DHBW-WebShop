function requireOwnership(getOwnerId) {
  return function (handler) {
    return async (req, res) => {
      if (!req.user) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Authentication required' }));
      }

      try {
        const ownerId = await getOwnerId(req);

        if (ownerId === null) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Resource not found' }));
        }

        if (req.user.userId !== ownerId && req.user.roleId !== 1) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Access denied – not the owner' }));
        }

        return handler(req, res);
      } catch (err) {
        console.error(err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Server error in ownership check' }));
      }
    };
  };
}

module.exports = requireOwnership;