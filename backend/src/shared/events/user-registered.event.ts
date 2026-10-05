import { DomainEvent, type DomainEventMetadata } from './domain-event';

// Carries only the id: events are persisted in the broker, so no PII or tokens go in them.
export class UserRegistered extends DomainEvent {
    constructor(userId: number, metadata?: DomainEventMetadata) {
        super(userId, metadata);
    }
}
