import type { MatchRepository } from '../../shared/repositories/match.types';
import type TournamentOwnershipService from '../../shared/services/tournament-ownership.service';

class DeleteMatchInteractor {
    private matchRepository: MatchRepository;
    private tournamentOwnershipService: TournamentOwnershipService;

    constructor(params: {
        matchRepository: MatchRepository;
        tournamentOwnershipService: TournamentOwnershipService;
    }) {
        this.matchRepository = params.matchRepository;
        this.tournamentOwnershipService = params.tournamentOwnershipService;
    }

    async execute(id: number, userId: number) {
        await this.tournamentOwnershipService.getMatchOwner(id, userId);

        return await this.matchRepository.delete(id);
    }

}

export = DeleteMatchInteractor;
