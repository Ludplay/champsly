import { DomainEvent } from './domain-event';

export class MatchResultRecorded extends DomainEvent {
    readonly player1Score: number;
    readonly player2Score: number;
    readonly winnerPlayerId: number | null;

    constructor(aggregateId: number, player1Score: number, player2Score: number, winnerPlayerId: number | null) {
        super(aggregateId);
        this.player1Score = player1Score;
        this.player2Score = player2Score;
        this.winnerPlayerId = winnerPlayerId;
    }
}
