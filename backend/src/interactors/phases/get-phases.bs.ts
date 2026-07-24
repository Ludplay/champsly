import { InferAttributes } from 'sequelize';
import type { PhaseRepository } from '../../shared/repositories/phase.types';
import { Phase } from '../../infra/db/models/phase';

class GetPhasesInteractor {
    private phaseRepository: PhaseRepository;

    constructor(params: { phaseRepository: PhaseRepository }) {
        this.phaseRepository = params.phaseRepository;
    }

    async execute() {

        const phases = await this.phaseRepository.getAll();

        const mappedPhases = phases.map(record => {
            const phase = record.toJSON<InferAttributes<Phase> & { Tournaments?: { name: string } }>();

            return {
                ...phase,
                tournament: phase.Tournaments?.name
            }
        });

        return mappedPhases;
    }

}

export = GetPhasesInteractor;
