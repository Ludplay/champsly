import type { DomainEvent } from '../../shared/events/domain-event';
import type { EventBus, DomainEventHandler, EventClass } from '../../shared/events/event-bus.types';
import logger from '../config/logger';

/**
 * Simple pub/sub, held in process memory — lost on restart, no replay, no cross-process
 * fan-out. That's the intentional trade-off for now: it lets interactors announce what
 * happened instead of calling side effects directly, without pulling in a broker yet.
 * Phase 5 swaps this for KafkaEventBus behind the same EventBus interface.
 */
class InMemoryEventBus implements EventBus {
    private handlers: Map<string, DomainEventHandler[]>;
    private logger: typeof logger;

    constructor(params: { logger: typeof logger }) {
        this.handlers = new Map();
        this.logger = params.logger;
    }

    subscribe<T extends DomainEvent>(eventClass: EventClass<T>, handler: DomainEventHandler<T>): void {
        const eventName = eventClass.name;
        const existingHandlers = this.handlers.get(eventName) || [];

        existingHandlers.push(handler as DomainEventHandler);
        this.handlers.set(eventName, existingHandlers);
    }

    async publish(event: DomainEvent): Promise<void> {
        const eventName = event.constructor.name;
        const handlers = this.handlers.get(eventName) || [];

        this.logger.debug({ eventName, eventId: event.eventId, aggregateId: event.aggregateId }, 'Publishing domain event');

        for (const handler of handlers) {
            await handler(event);
        }
    }
}

export = InMemoryEventBus;
