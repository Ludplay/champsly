import type TournamentOwnershipService from '../../shared/services/tournament-ownership.service';

class ReadPhaseInteractor {
    private tournamentOwnershipService: TournamentOwnershipService;

    constructor(params: { tournamentOwnershipService: TournamentOwnershipService }) {
        this.tournamentOwnershipService = params.tournamentOwnershipService;
    }

    async execute(id: number, userId: number) {
        return await this.tournamentOwnershipService.getPhaseOwner(id, userId);
    }

}

export = ReadPhaseInteractor;
