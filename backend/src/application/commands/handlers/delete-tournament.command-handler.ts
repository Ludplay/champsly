import type { TournamentRepository } from '../../../shared/repositories/tournament.types';
import type TournamentOwnershipService from '../../../shared/services/tournament-ownership.service';
import type { DeleteTournamentCommand } from '../delete-tournament.command';

class DeleteTournamentCommandHandler {
    private tournamentRepository: TournamentRepository;
    private tournamentOwnershipService: TournamentOwnershipService;

    constructor(params: {
        tournamentRepository: TournamentRepository;
        tournamentOwnershipService: TournamentOwnershipService;
    }) {
        this.tournamentRepository = params.tournamentRepository;
        this.tournamentOwnershipService = params.tournamentOwnershipService;
    }

    async execute(command: DeleteTournamentCommand) {
        await this.tournamentOwnershipService.getTournamentOwner(command.id, command.userId);

        return await this.tournamentRepository.delete(command.id);
    }

}

export = DeleteTournamentCommandHandler;
