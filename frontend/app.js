const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const router = require('./routes/router');

const app = express();
const PORT = 80;

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', router);

app.listen(PORT, () => {
  console.log(`[frontend] Express-Frontend läuft auf http://localhost:${PORT}`);
});