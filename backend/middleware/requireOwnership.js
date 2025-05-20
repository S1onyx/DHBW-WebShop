function requireOwnership(getOwnerId) {
  return function (handler) {
    return async (req, res) => {
      if (!req.user) {
        if (res.end.name === 'bound end') {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Authentication required' }));
        }
        return;
      }

      try {
        const ownerId = await getOwnerId(req);

        if (ownerId === null) {
          if (res.end.name === 'bound end') {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Resource not found' }));
          }
          return;
        }

        if (req.user.userId !== ownerId && req.user.roleId !== 1) {
          if (res.end.name === 'bound end') {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Access denied – not the owner' }));
          }
          return;
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