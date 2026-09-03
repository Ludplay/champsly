import type { TournamentRepository } from '../../shared/repositories/tournament.types';
import type TournamentOwnershipService from '../../shared/services/tournament-ownership.service';

class DeleteTournamentInteractor {
    private tournamentRepository: TournamentRepository;
    private tournamentOwnershipService: TournamentOwnershipService;

    constructor(params: {
        tournamentRepository: TournamentRepository;
        tournamentOwnershipService: TournamentOwnershipService;
    }) {
        this.tournamentRepository = params.tournamentRepository;
        this.tournamentOwnershipService = params.tournamentOwnershipService;
    }

    async execute(id: number, userId: number) {
        await this.tournamentOwnershipService.getTournamentOwner(id, userId);

        return await this.tournamentRepository.delete(id);
    }

}

export = DeleteTournamentInteractor;
