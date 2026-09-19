export class GenerateGroupsPhaseMatchesCommand {
    readonly tournamentId: number;
    readonly userId: number;

    constructor(params: { tournamentId: number; userId: number }) {
        this.tournamentId = params.tournamentId;
        this.userId = params.userId;
    }
}
