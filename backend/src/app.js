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

if (config.localAssetDir) {
  app.use('/assets', express.static(config.localAssetDir, {
    fallthrough: true,
    maxAge: '10m'
  }));
}

if (config.localModelDir) {
  app.use('/models', express.static(config.localModelDir, {
    fallthrough: true,
    maxAge: '10m'
  }));
}

app.use(routes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
