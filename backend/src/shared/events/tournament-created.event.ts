import { DomainEvent, type DomainEventMetadata } from './domain-event';

export class TournamentCreated extends DomainEvent {
    readonly name: string;

    constructor(aggregateId: number, name: string, metadata?: DomainEventMetadata) {
        super(aggregateId, metadata);
        this.name = name;
    }
}
