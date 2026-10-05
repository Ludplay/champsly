import type { PhaseRepository } from '../../../shared/repositories/phase.types';
import type TournamentOwnershipService from '../../../shared/services/tournament-ownership.service';
import { isPhaseStatus } from '../../../shared/value-objects';
import { ValidationError } from '../../../shared/errors';
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
        const { status, ...otherChanges } = command.changes;

        if (status !== undefined && !isPhaseStatus(status)) {
            throw new ValidationError(`Invalid phase status: ${status}`);
        }

        await this.tournamentOwnershipService.getPhaseOwner(command.id, command.userId);

        const changes = status === undefined ? otherChanges : { ...otherChanges, status };

        return await this.phaseRepository.update(command.id, changes);
    }

}

export = UpdatePhaseCommandHandler;
