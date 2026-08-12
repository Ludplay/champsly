import { DomainEvent } from './domain-event';

export class PhaseCompleted extends DomainEvent {
    readonly tournamentId: number;

    constructor(aggregateId: number, tournamentId: number) {
        super(aggregateId);
        this.tournamentId = tournamentId;
    }
}
