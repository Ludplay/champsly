import { DomainEvent } from './domain-event';

export class TournamentCreated extends DomainEvent {
    readonly name: string;

    constructor(aggregateId: number, name: string) {
        super(aggregateId);
        this.name = name;
    }
}
