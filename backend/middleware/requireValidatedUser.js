module.exports = function requireValidatedUser(req, res, next) {
  if (!req.user || req.user.statusId !== 1) {
    return res.status(403).json({ success: false, error: 'Account not validated', code: 403 });
  }
  next();
};