import { randomUUID } from 'crypto';

// Supplied only when rebuilding an event that already happened (e.g. read back from a
// broker), so it keeps its original identity instead of getting a fresh one.
export interface DomainEventMetadata {
    eventId: string;
    occurredOn: Date;
}

/**
 * Base class for every domain event. An event announces that something happened —
 * it never mutates state itself and carries just enough identity (eventId, occurredOn,
 * aggregateId) for a subscriber to know what fired, when, and about which entity.
 */
export abstract class DomainEvent {
    readonly eventId: string;
    readonly occurredOn: Date;
    readonly aggregateId: number | string;

    protected constructor(aggregateId: number | string, metadata?: DomainEventMetadata) {
        this.eventId = metadata?.eventId ?? randomUUID();
        this.occurredOn = metadata?.occurredOn ?? new Date();
        this.aggregateId = aggregateId;
    }
}
