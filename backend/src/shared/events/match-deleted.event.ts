import { DomainEvent, type DomainEventMetadata } from './domain-event';
import type { MatchEventContext } from './match-event-context.types';

export class MatchDeleted extends DomainEvent {
    readonly tournamentId: number;
    readonly phaseId: number;
    readonly groupId: number | null;
    readonly player1Id: number;
    readonly player2Id: number;

    constructor(props: MatchEventContext, metadata?: DomainEventMetadata) {
        super(props.matchId, metadata);
        this.tournamentId = props.tournamentId;
        this.phaseId = props.phaseId;
        this.groupId = props.groupId;
        this.player1Id = props.player1Id;
        this.player2Id = props.player2Id;
    }
}
