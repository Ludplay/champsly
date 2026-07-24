import type { PhaseRepository } from '../../shared/repositories/phase.types';

class ReadPhaseInteractor {
    private phaseRepository: PhaseRepository;

    constructor(params: { phaseRepository: PhaseRepository }) {
        this.phaseRepository = params.phaseRepository;
    }

    async execute(id: number) {
        return await this.phaseRepository.getOne(id);
    }

}

export = ReadPhaseInteractor;
