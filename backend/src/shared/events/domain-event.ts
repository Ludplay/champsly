import { randomUUID } from 'crypto';

/**
 * Base class for every domain event. An event announces that something happened —
 * it never mutates state itself and carries just enough identity (eventId, occurredOn,
 * aggregateId) for a subscriber to know what fired, when, and about which entity.
 */
export abstract class DomainEvent {
    readonly eventId: string;
    readonly occurredOn: Date;
    readonly aggregateId: number | string;

    protected constructor(aggregateId: number | string) {
        this.eventId = randomUUID();
        this.occurredOn = new Date();
        this.aggregateId = aggregateId;
    }
}
