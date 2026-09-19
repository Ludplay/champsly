import { InferAttributes } from 'sequelize';
import type { PhaseRepository } from '../../../shared/repositories/phase.types';
import { Phase } from '../../../infra/db/models/phase';
import type TournamentOwnershipService from '../../../shared/services/tournament-ownership.service';
import type { PhaseDTO } from '../../dtos/phase.dto';
import type { ReadPhaseQuery } from '../read-phase.query';

class ReadPhaseQueryHandler {
    private phaseRepository: PhaseRepository;
    private tournamentOwnershipService: TournamentOwnershipService;

    constructor(params: {
        phaseReadRepository: PhaseRepository;
        tournamentReadOwnershipService: TournamentOwnershipService;
    }) {
        this.phaseRepository = params.phaseReadRepository;
        this.tournamentOwnershipService = params.tournamentReadOwnershipService;
    }

    async execute(query: ReadPhaseQuery): Promise<PhaseDTO> {
        await this.tournamentOwnershipService.getPhaseOwner(query.id, query.userId);

        // Ownership already confirmed the phase exists
        const record = await this.phaseRepository.getOneWithTournament(query.id);
        const phase = record!.toJSON<InferAttributes<Phase> & { Tournaments?: { name: string } }>();

        return {
            ...phase,
            tournament: phase.Tournaments?.name
        };
    }

}

export = ReadPhaseQueryHandler;
