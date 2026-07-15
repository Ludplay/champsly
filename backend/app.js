require('dotenv').config({ quiet: true });

const express = require('express');
const pinoHttp = require('pino-http');
const { scopePerRequest } = require('awilix-express');

const logger = require('./src/infra/config/logger');
const routes = require('./src/infra/http/routes');
const container = require('./src/infra/config/register');
const errorHandler = require('./src/infra/http/middlewares/error-handler.middleware');
const { globalLimiter, writeLimiter } = require('./src/infra/http/middlewares/rate-limit.middleware');

const app = express();
const port = process.env.PORT || 4001;

app.use(pinoHttp({ logger }));
app.use(express.json());
app.use(globalLimiter);
app.use(writeLimiter);
app.use(scopePerRequest(container));
app.use(routes);
app.use(errorHandler);

app.listen(port, '0.0.0.0', () => {
  logger.info(`Example app listening on port ${port}`);
});
