import type { MatchRepository } from '../../../shared/repositories/match.types';
import type TournamentOwnershipService from '../../../shared/services/tournament-ownership.service';
import type { DeleteMatchCommand } from '../delete-match.command';

class DeleteMatchCommandHandler {
    private matchRepository: MatchRepository;
    private tournamentOwnershipService: TournamentOwnershipService;

    constructor(params: {
        matchRepository: MatchRepository;
        tournamentOwnershipService: TournamentOwnershipService;
    }) {
        this.matchRepository = params.matchRepository;
        this.tournamentOwnershipService = params.tournamentOwnershipService;
    }

    async execute(command: DeleteMatchCommand) {
        await this.tournamentOwnershipService.getMatchOwner(command.id, command.userId);

        return await this.matchRepository.delete(command.id);
    }

}

export = DeleteMatchCommandHandler;
