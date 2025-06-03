// utils/env.js
const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'http://backend:3000'
    : 'http://localhost:3000';

module.exports = { API_BASE_URL };