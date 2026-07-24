import { CreationAttributes } from 'sequelize';
import type { PhaseRepository } from '../../shared/repositories/phase.types';
import { Phase } from '../../infra/db/models/phase';

class UpdatePhaseInteractor {
    private phaseRepository: PhaseRepository;

    constructor(params: { phaseRepository: PhaseRepository }) {
        this.phaseRepository = params.phaseRepository;
    }

    async execute(id: number, input: Partial<CreationAttributes<Phase>>) {
        return await this.phaseRepository.update(id, input);
    }

}

export = UpdatePhaseInteractor;
