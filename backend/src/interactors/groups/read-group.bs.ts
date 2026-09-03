import type TournamentOwnershipService from '../../shared/services/tournament-ownership.service';

class ReadGroupInteractor {
    private tournamentOwnershipService: TournamentOwnershipService;

    constructor(params: { tournamentOwnershipService: TournamentOwnershipService }) {
        this.tournamentOwnershipService = params.tournamentOwnershipService;
    }

    async execute(id: number, userId: number) {
        return await this.tournamentOwnershipService.getGroupOwner(id, userId);
    }

}

export = ReadGroupInteractor;
