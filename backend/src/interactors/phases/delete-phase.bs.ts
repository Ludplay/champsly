import type { PhaseRepository } from '../../shared/repositories/phase.types';

class DeletePhaseInteractor {
    private phaseRepository: PhaseRepository;

    constructor(params: { phaseRepository: PhaseRepository }) {
        this.phaseRepository = params.phaseRepository;
    }

    async execute(id: number) {
        return await this.phaseRepository.delete(id);
    }

}

export = DeletePhaseInteractor;
