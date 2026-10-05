export interface MatchEventContext {
    matchId: number;
    tournamentId: number;
    phaseId: number;
    groupId: number | null;
    player1Id: number;
    player2Id: number;
}
