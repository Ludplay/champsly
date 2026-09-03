import { CreationAttributes } from 'sequelize';
import type { PhaseRepository } from '../../shared/repositories/phase.types';
import type TournamentOwnershipService from '../../shared/services/tournament-ownership.service';
import { Phase } from '../../infra/db/models/phase';

class UpdatePhaseInteractor {
    private phaseRepository: PhaseRepository;
    private tournamentOwnershipService: TournamentOwnershipService;

    constructor(params: {
        phaseRepository: PhaseRepository;
        tournamentOwnershipService: TournamentOwnershipService;
    }) {
        this.phaseRepository = params.phaseRepository;
        this.tournamentOwnershipService = params.tournamentOwnershipService;
    }

    async execute(id: number, input: Partial<CreationAttributes<Phase>>, userId: number) {
        await this.tournamentOwnershipService.getPhaseOwner(id, userId);

        return await this.phaseRepository.update(id, input);
    }

}

export = UpdatePhaseInteractor;
