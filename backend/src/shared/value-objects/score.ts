export type ScoreWinner = 'player1' | 'player2' | null;

export class Score {
    readonly player1: number;
    readonly player2: number;

    constructor(player1: number, player2: number) {
        if (!Number.isInteger(player1) || player1 < 0) {
            throw new Error(`Score.player1 must be a non-negative integer, got ${player1}`);
        }

        if (!Number.isInteger(player2) || player2 < 0) {
            throw new Error(`Score.player2 must be a non-negative integer, got ${player2}`);
        }

        this.player1 = player1;
        this.player2 = player2;
    }

    winner(): ScoreWinner {
        if (this.player1 > this.player2) {
            return 'player1';
        }

        if (this.player2 > this.player1) {
            return 'player2';
        }

        return null;
    }
}
