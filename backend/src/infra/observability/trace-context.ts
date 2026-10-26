import { context, defaultTextMapGetter, defaultTextMapSetter, ROOT_CONTEXT, type Context } from '@opentelemetry/api';
import { W3CTraceContextPropagator } from '@opentelemetry/core';

// Stored trace context is always W3C, independent of the propagator configured for headers.
const w3cPropagator = new W3CTraceContextPropagator();

// Null when there is no active span, e.g. outside a request or consumed message.
export function getActiveTraceparent(): string | null {
    const carrier: Record<string, string> = {};

    w3cPropagator.inject(context.active(), carrier, defaultTextMapSetter);

    return carrier.traceparent ?? null;
}

export function contextFromTraceparent(traceparent: string | null): Context {
    if (!traceparent) {
        return ROOT_CONTEXT;
    }

    const carrier = { traceparent };

    return w3cPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter);
}
