import { CreationAttributes } from 'sequelize';
import type { TournamentRepository } from '../../shared/repositories/tournament.types';
import type TournamentOwnershipService from '../../shared/services/tournament-ownership.service';
import { Tournament } from '../../infra/db/models/tournament';

class UpdateTournamentInteractor {
    private tournamentRepository: TournamentRepository;
    private tournamentOwnershipService: TournamentOwnershipService;

    constructor(params: {
        tournamentRepository: TournamentRepository;
        tournamentOwnershipService: TournamentOwnershipService;
    }) {
        this.tournamentRepository = params.tournamentRepository;
        this.tournamentOwnershipService = params.tournamentOwnershipService;
    }

    async execute(id: number, input: Partial<CreationAttributes<Tournament>>, userId: number) {
        await this.tournamentOwnershipService.getTournamentOwner(id, userId);

        return await this.tournamentRepository.update(id, input);
    }

}

export = UpdateTournamentInteractor;
