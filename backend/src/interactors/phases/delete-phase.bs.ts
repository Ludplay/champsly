import type { PhaseRepository } from '../../shared/repositories/phase.types';
import type TournamentOwnershipService from '../../shared/services/tournament-ownership.service';

class DeletePhaseInteractor {
    private phaseRepository: PhaseRepository;
    private tournamentOwnershipService: TournamentOwnershipService;

    constructor(params: {
        phaseRepository: PhaseRepository;
        tournamentOwnershipService: TournamentOwnershipService;
    }) {
        this.phaseRepository = params.phaseRepository;
        this.tournamentOwnershipService = params.tournamentOwnershipService;
    }

    async execute(id: number, userId: number) {
        await this.tournamentOwnershipService.getPhaseOwner(id, userId);

        return await this.phaseRepository.delete(id);
    }

}

export = DeletePhaseInteractor;
