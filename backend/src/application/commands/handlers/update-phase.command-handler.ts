import type { PhaseRepository } from '../../../shared/repositories/phase.types';
import type TournamentOwnershipService from '../../../shared/services/tournament-ownership.service';
import type { UpdatePhaseCommand } from '../update-phase.command';

class UpdatePhaseCommandHandler {
    private phaseRepository: PhaseRepository;
    private tournamentOwnershipService: TournamentOwnershipService;

    constructor(params: {
        phaseRepository: PhaseRepository;
        tournamentOwnershipService: TournamentOwnershipService;
    }) {
        this.phaseRepository = params.phaseRepository;
        this.tournamentOwnershipService = params.tournamentOwnershipService;
    }

    async execute(command: UpdatePhaseCommand) {
        await this.tournamentOwnershipService.getPhaseOwner(command.id, command.userId);

        return await this.phaseRepository.update(command.id, command.changes);
    }

}

export = UpdatePhaseCommandHandler;
