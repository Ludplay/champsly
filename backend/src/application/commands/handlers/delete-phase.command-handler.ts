import type { PhaseRepository } from '../../../shared/repositories/phase.types';
import type TournamentOwnershipService from '../../../shared/services/tournament-ownership.service';
import type { DeletePhaseCommand } from '../delete-phase.command';

class DeletePhaseCommandHandler {
    private phaseRepository: PhaseRepository;
    private tournamentOwnershipService: TournamentOwnershipService;

    constructor(params: {
        phaseRepository: PhaseRepository;
        tournamentOwnershipService: TournamentOwnershipService;
    }) {
        this.phaseRepository = params.phaseRepository;
        this.tournamentOwnershipService = params.tournamentOwnershipService;
    }

    async execute(command: DeletePhaseCommand) {
        await this.tournamentOwnershipService.getPhaseOwner(command.id, command.userId);

        return await this.phaseRepository.delete(command.id);
    }

}

export = DeletePhaseCommandHandler;
