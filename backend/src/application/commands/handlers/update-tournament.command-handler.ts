import type { TournamentRepository } from '../../../shared/repositories/tournament.types';
import type TournamentOwnershipService from '../../../shared/services/tournament-ownership.service';
import type { UpdateTournamentCommand } from '../update-tournament.command';

class UpdateTournamentCommandHandler {
    private tournamentRepository: TournamentRepository;
    private tournamentOwnershipService: TournamentOwnershipService;

    constructor(params: {
        tournamentRepository: TournamentRepository;
        tournamentOwnershipService: TournamentOwnershipService;
    }) {
        this.tournamentRepository = params.tournamentRepository;
        this.tournamentOwnershipService = params.tournamentOwnershipService;
    }

    async execute(command: UpdateTournamentCommand) {
        await this.tournamentOwnershipService.getTournamentOwner(command.id, command.userId);

        return await this.tournamentRepository.update(command.id, command.changes);
    }

}

export = UpdateTournamentCommandHandler;
