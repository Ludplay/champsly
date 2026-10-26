// Preloaded with --import so instrumentation is installed before any instrumented module is required.
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { KafkaJsInstrumentation } from '@opentelemetry/instrumentation-kafkajs';
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino';
import * as Sentry from '@sentry/node';

const UNTRACED_PATHS = new Set(['/metrics', '/health', '/health/ready']);

const instrumentations = [
    // Prometheus scrapes and health probes would otherwise produce a root trace every interval.
    new HttpInstrumentation({ ignoreIncomingRequestHook: (request) => UNTRACED_PATHS.has(request.url ?? '') }),
    new ExpressInstrumentation(),
    // Background polling (outbox relay) would otherwise produce a root trace per query.
    new PgInstrumentation({ requireParentSpan: true }),
    new KafkaJsInstrumentation(),
    // Only adds trace_id/span_id to log lines; logs still leave through stdout.
    new PinoInstrumentation({ disableLogSending: true })
];

const sdk = new NodeSDK({
    serviceName: process.env.OTEL_SERVICE_NAME || 'champsly-backend',
    traceExporter: new OTLPTraceExporter(),
    // Empty on purpose: the SDK would otherwise export metrics and logs over OTLP as well.
    metricReaders: [],
    logRecordProcessors: [],
    instrumentations
});

sdk.start();

const sentryDsn = process.env.SENTRY_DSN;
const SENTRY_FLUSH_TIMEOUT_MS = 2000;

// Errors only: OpenTelemetry owns tracing, and the integration tags each event with the active
// span's trace ID, so a Sentry issue points at its Jaeger trace. Must run after sdk.start().
if (sentryDsn) {
    const sentryOptions: Sentry.NodeOptions = {
        dsn: sentryDsn,
        environment: process.env.NODE_ENV || 'development',
        enableOpenTelemetrySetup: false,
        integrations: [Sentry.openTelemetryIntegration()]
    };

    Sentry.init(sentryOptions);
}

// Flushes buffered spans and pending Sentry events; call before the process exits.
export async function shutdownObservability(): Promise<void> {
    await Promise.all(
        [
            sdk.shutdown(), 
            Sentry.close(SENTRY_FLUSH_TIMEOUT_MS)
        ]
    );
}
