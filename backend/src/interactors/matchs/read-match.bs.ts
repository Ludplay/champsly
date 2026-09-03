import type TournamentOwnershipService from '../../shared/services/tournament-ownership.service';

class ReadMatchInteractor {
    private tournamentOwnershipService: TournamentOwnershipService;

    constructor(params: { tournamentOwnershipService: TournamentOwnershipService }) {
        this.tournamentOwnershipService = params.tournamentOwnershipService;
    }

    async execute(id: number, userId: number) {
        return await this.tournamentOwnershipService.getMatchOwner(id, userId);
    }

}

export = ReadMatchInteractor;
