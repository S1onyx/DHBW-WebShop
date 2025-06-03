// backend/utils/cors.js
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:1337'); // evtl. später auf env umstellen
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function handleCorsPreflight(req, res) {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    res.writeHead(204);
    res.end();
    return true;
  }

  return false;
}

module.exports = {
  handleCorsPreflight,
  setCorsHeaders
};