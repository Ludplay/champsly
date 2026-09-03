import { CreationAttributes } from 'sequelize';
import type { PhaseRepository } from '../../shared/repositories/phase.types';
import type TournamentOwnershipService from '../../shared/services/tournament-ownership.service';
import { Phase } from '../../infra/db/models/phase';

class CreatePhaseInteractor {
    private phaseRepository: PhaseRepository;
    private tournamentOwnershipService: TournamentOwnershipService;

    constructor(params: {
        phaseRepository: PhaseRepository;
        tournamentOwnershipService: TournamentOwnershipService;
    }) {
        this.phaseRepository = params.phaseRepository;
        this.tournamentOwnershipService = params.tournamentOwnershipService;
    }

    async execute(input: Pick<CreationAttributes<Phase>, 'tournament_id' | 'name' | 'status' | 'number'>, userId: number) {
        const { tournament_id, name, status, number } = input;

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

export = CreatePhaseInteractor;
