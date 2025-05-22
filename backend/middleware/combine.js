// backend/middleware/combine.js
function interceptRes(res) {
  const noop = () => {};
  return {
    ...res,
    writeHead: noop,
    end: noop,
    write: noop
  };
}

function or(...middlewares) {
  return (handler) => async (req, res) => {
    for (const mw of middlewares) {
      let allowed = false;

      const next = () => {
        allowed = true;
        return Promise.resolve();
      };

      await mw(next)(req, interceptRes(res));

      if (allowed) {
        return handler(req, res);
      }
    }

    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: 'Access denied (or)',
      code: 403
    }));
  };
}

function and(...middlewares) {
  return (handler) => {
    return middlewares.reduceRight((acc, mw) => mw(acc), handler);
  };
}

module.exports = { or, and };