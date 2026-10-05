import type { PhaseRepository } from '../../../shared/repositories/phase.types';
import type TournamentOwnershipService from '../../../shared/services/tournament-ownership.service';
import { isPhaseStatus } from '../../../shared/value-objects';
import { ValidationError } from '../../../shared/errors';
import type { CreatePhaseCommand } from '../create-phase.command';

class CreatePhaseCommandHandler {
    private phaseRepository: PhaseRepository;
    private tournamentOwnershipService: TournamentOwnershipService;

    constructor(params: {
        phaseRepository: PhaseRepository;
        tournamentOwnershipService: TournamentOwnershipService;
    }) {
        this.phaseRepository = params.phaseRepository;
        this.tournamentOwnershipService = params.tournamentOwnershipService;
    }

    async execute(command: CreatePhaseCommand) {
        const { tournament_id, name, status, number, userId } = command;

        if (!isPhaseStatus(status)) {
            throw new ValidationError(`Invalid phase status: ${status}`);
        }

        await this.tournamentOwnershipService.getTournamentOwner(tournament_id, userId);

        const inputRecord = {
            tournament_id,
            name,
            status,
            number
        };

        return await this.phaseRepository.create(inputRecord);
    }

}

export = CreatePhaseCommandHandler;
