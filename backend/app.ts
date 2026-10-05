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
import { scopedEventHandler } from './src/infra/events/scoped-event-handler';
import { UserRegistered, MatchResultRecorded, GroupStandingsUpdated } from './src/shared/events';
import SendVerificationEmailConsumer from './src/infra/events/consumers/send-verification-email.consumer';
import PhaseCompletionConsumer from './src/infra/events/consumers/phase-completion.consumer';
import GroupStandingsProjectionConsumer from './src/infra/events/consumers/group-standings-projection.consumer';

const app = express();
const port = Number(process.env.PORT) || 4001;

const eventBus = container.resolve('eventBus');

// Every subscription must be registered before eventBus.start(); the first argument is the consumer group.
eventBus.subscribe(SendVerificationEmailConsumer.consumerGroup, UserRegistered, scopedEventHandler(container, 'sendVerificationEmailConsumer'));
eventBus.subscribe(PhaseCompletionConsumer.consumerGroup, MatchResultRecorded, scopedEventHandler(container, 'phaseCompletionConsumer'));
eventBus.subscribe(GroupStandingsProjectionConsumer.consumerGroup, GroupStandingsUpdated, scopedEventHandler(container, 'groupStandingsProjectionConsumer'));

// Stream processors and the outbox relay talk to Kafka directly, so they only run where a broker exists.
const isTestEnvironment = process.env.NODE_ENV === 'test';
const groupStandingsProcessor = isTestEnvironment ? null : container.resolve('groupStandingsProcessor');
const outboxRelay = isTestEnvironment ? null : container.resolve('outboxRelay');

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

async function start() {
  await eventBus.start();

  await groupStandingsProcessor?.start();

  // After eventBus.start(), which creates the topics the relay publishes to.
  await outboxRelay?.start();

  const server = app.listen(port, '0.0.0.0', () => {
    logger.info(`Example app listening on port ${port}`);
  });

  const shutdown = async (signal: NodeJS.Signals) => {
    logger.info({ signal }, 'Shutting down');
    server.close();

    await outboxRelay?.stop();
    await groupStandingsProcessor?.stop();
    await eventBus.stop();
    process.exit(0);
  };

  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}

start().catch((error) => {
  logger.fatal({ err: error }, 'Failed to start');
  process.exit(1);
});
