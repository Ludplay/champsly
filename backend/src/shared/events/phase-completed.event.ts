import { DomainEvent, type DomainEventMetadata } from './domain-event';

export class PhaseCompleted extends DomainEvent {
    readonly tournamentId: number;

    constructor(aggregateId: number, tournamentId: number, metadata?: DomainEventMetadata) {
        super(aggregateId, metadata);
        this.tournamentId = tournamentId;
    }
}
