import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { scopePerRequest } from 'awilix-express';

import logger from './src/infra/config/logger';
import routes from './src/infra/http/routes';
import container from './src/infra/config/register';
import errorHandler from './src/infra/http/middlewares/error-handler.middleware';
import { globalLimiter, writeLimiter } from './src/infra/http/middlewares/rate-limit.middleware';

const app = express();
const port = Number(process.env.PORT) || 4001;

// Domain-event subscribers are wired once at startup, not per-request — resolving
// the eventBus/emailSender singletons and calling .subscribe() explicitly here keeps
// the wiring visible instead of hiding it as a constructor side effect.
container.resolve('sendVerificationEmailOnUserRegisteredSubscriber').subscribe();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"]
    }
  }
}));
app.use(pinoHttp({ logger }));
app.use(express.json());
app.use(cookieParser());
app.use(globalLimiter);
app.use(writeLimiter);
app.use(scopePerRequest(container));
app.use(routes);
app.use(errorHandler);

app.listen(port, '0.0.0.0', () => {
  logger.info(`Example app listening on port ${port}`);
});
