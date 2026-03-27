const express = require('express');
const cors = require('cors');

const config = require('./config');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const app = express();

const corsOptions = {
  origin: config.corsOrigin === '*' ? true : config.corsOrigin,
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));

app.use(routes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
