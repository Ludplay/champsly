export class GetTournamentMatchesQuery {
    readonly tournamentId: number;
    readonly userId: number;

    constructor(params: { tournamentId: number; userId: number }) {
        this.tournamentId = params.tournamentId;
        this.userId = params.userId;
    }
}
