// Prometheus metrics (prom-client); Prometheus scrapes /metrics.
import type { NextFunction, Request, Response } from 'express';
import { context } from '@opentelemetry/api';
import { getRPCMetadata, RPCType } from '@opentelemetry/core';
import { collectDefaultMetrics, Counter, Gauge, Histogram, Registry } from 'prom-client';
import type { CountOptions } from 'sequelize';
import { readDb } from '../db/models';
import { getAllRegistrations } from '../adapters/events/event-registry';
import { TournamentStatus } from '../../shared/value-objects/tournament-status';
import logger from '../config/logger';

const UNMATCHED_ROUTE = 'unmatched';
const NANOSECONDS_PER_SECOND = 1e9;

const metricsRegistry = new Registry();

collectDefaultMetrics({ register: metricsRegistry });

const httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'] as const,
    registers: [metricsRegistry]
});

const domainEventsPublished = new Counter({
    name: 'domain_events_published_total',
    help: 'Domain events sent to Kafka by the outbox relay',
    labelNames: ['event_type'] as const,
    registers: [metricsRegistry]
});

// Starts every series at 0: increase()/rate() can't see a series' first increment, so it would be lost.
const INITIAL_EVENT_COUNT = 0;
getAllRegistrations().forEach((registration) => {
    const eventType = registration.eventClass.name;

    domainEventsPublished.inc({ event_type: eventType }, INITIAL_EVENT_COUNT);
});

/* State, not events: counted from the DB on each scrape, so it survives restarts and is the same on every
  replica (dashboards aggregate it with max, not sum). On a DB error the series are dropped, not left stale. */
const tournamentsByStatus = new Gauge({
    name: 'tournaments',
    help: 'Tournaments by status, counted from the database at scrape time',
    labelNames: ['status'] as const,
    registers: [metricsRegistry],
    async collect() {
        try {
            const countOptions: CountOptions & { group: string[] } = { group: ['status'], logging: false };
            const countsByStatus = await readDb.Tournament.count(countOptions);

            this.reset();

            // Statuses with no tournaments are reported as 0 instead of going missing.
            Object.values(TournamentStatus).forEach((status) => {
                this.set({ status }, 0);
            });

            countsByStatus.forEach((row) => {
                const status = String(row.status);

                this.set({ status }, row.count);
            });
        } catch (error) {
            this.reset();
            logger.warn({ err: error }, 'Could not count tournaments for metrics');
        }
    }
});

/* Labels by route template (/api/v1/tournaments/:id) to bound cardinality. Taken from the OTEL express
  instrumentation: on errors Express resets req.baseUrl, so req.route alone loses the /api/vN prefix. */
export function httpMetricsMiddleware(req: Request, res: Response, next: NextFunction): void {
    const startTime = process.hrtime.bigint();
    const rpcMetadata = getRPCMetadata(context.active());

    res.once('finish', () => {
        const durationSeconds = Number(process.hrtime.bigint() - startTime) / NANOSECONDS_PER_SECOND;
        // Without req.route no handler was reached, and the instrumentation holds a middleware's mount path.
        const matchedRoute = req.route && rpcMetadata?.type === RPCType.HTTP ? rpcMetadata.route : undefined;
        const labels = {
            method: req.method,
            route: matchedRoute ?? UNMATCHED_ROUTE,
            status_code: String(res.statusCode)
        };

        httpRequestDuration.observe(labels, durationSeconds);
    });

    next();
}

export function recordDomainEventPublished(eventType: string): void {
    domainEventsPublished.inc({ event_type: eventType });
}

export async function prometheusMetricsHandler(req: Request, res: Response): Promise<void> {
    const metrics = await metricsRegistry.metrics();

    res.set('Content-Type', metricsRegistry.contentType);
    res.send(metrics);
}
