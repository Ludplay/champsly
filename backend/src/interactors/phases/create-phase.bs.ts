import { CreationAttributes } from 'sequelize';
import type { PhaseRepository } from '../../shared/repositories/phase.types';
import { Phase } from '../../infra/db/models/phase';

class CreatePhaseInteractor {
    private phaseRepository: PhaseRepository;

    constructor(params: {
        phaseRepository: PhaseRepository;
    }) {
        this.phaseRepository = params.phaseRepository;
    }

    async execute(input: Pick<CreationAttributes<Phase>, 'tournament_id' | 'name' | 'status' | 'number'>) {
        const { tournament_id, name, status, number } = input;

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
