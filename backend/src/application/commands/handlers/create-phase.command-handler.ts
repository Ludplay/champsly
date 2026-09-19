import type { PhaseRepository } from '../../../shared/repositories/phase.types';
import type TournamentOwnershipService from '../../../shared/services/tournament-ownership.service';
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
