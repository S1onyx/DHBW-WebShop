const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const router = require('./routes/router');

const app = express();
app.use('/js', express.static(path.join(__dirname, 'frontend', 'js')));
app.use('/images', express.static(path.join(__dirname, 'frontend', 'images')));
const PORT = 1337;

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use('/css', express.static(path.join(__dirname, 'css')));

app.use('/', router);

app.listen(PORT, () => {
  console.log(`[frontend] Express-Frontend läuft auf http://localhost:${PORT}`);
});