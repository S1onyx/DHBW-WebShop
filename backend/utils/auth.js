// backend/utils/auth.js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'supersecretkey';
const JWT_ACCESS_EXPIRATION = parseInt(process.env.JWT_ACCESS_EXPIRATION) || 60; // Minuten

function signAccessToken(user) {
  const payload = {
    userId: user.id,
  };

  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: `${JWT_ACCESS_EXPIRATION}m`,
  });
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET);
  } catch (err) {
    console.warn('[JWT VERIFY ERROR]', err.message);
    return null;
  }
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
};