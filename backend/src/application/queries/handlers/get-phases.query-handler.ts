import { InferAttributes } from 'sequelize';
import type { PhaseRepository } from '../../../shared/repositories/phase.types';
import { Phase } from '../../../infra/db/models/phase';
import type { PhaseDTO } from '../../dtos/phase.dto';
import type { GetPhasesQuery } from '../get-phases.query';

class GetPhasesQueryHandler {
    private phaseRepository: PhaseRepository;

    constructor(params: { phaseReadRepository: PhaseRepository }) {
        this.phaseRepository = params.phaseReadRepository;
    }

    async execute(query: GetPhasesQuery): Promise<PhaseDTO[]> {

        const phases = await this.phaseRepository.getAllByUser(query.userId);

        return phases.map((record) => {
            const phase = record.toJSON<InferAttributes<Phase> & { Tournaments?: { name: string } }>();

            return {
                ...phase,
                tournament: phase.Tournaments?.name
            };
        });
    }

}

export = GetPhasesQueryHandler;
