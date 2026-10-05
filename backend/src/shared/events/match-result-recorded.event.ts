import { DomainEvent, type DomainEventMetadata } from './domain-event';
import type { MatchEventContext } from './match-event-context.types';

export interface MatchResultRecordedProps extends MatchEventContext {
    player1Score: number;
    player2Score: number;
    winnerPlayerId: number | null;
}

export class MatchResultRecorded extends DomainEvent {
    readonly tournamentId: number;
    readonly phaseId: number;
    readonly groupId: number | null;
    readonly player1Id: number;
    readonly player2Id: number;
    readonly player1Score: number;
    readonly player2Score: number;
    readonly winnerPlayerId: number | null;

    constructor(props: MatchResultRecordedProps, metadata?: DomainEventMetadata) {
        super(props.matchId, metadata);
        this.tournamentId = props.tournamentId;
        this.phaseId = props.phaseId;
        this.groupId = props.groupId;
        this.player1Id = props.player1Id;
        this.player2Id = props.player2Id;
        this.player1Score = props.player1Score;
        this.player2Score = props.player2Score;
        this.winnerPlayerId = props.winnerPlayerId;
    }
}
