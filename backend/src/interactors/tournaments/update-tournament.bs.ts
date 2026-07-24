import { CreationAttributes } from 'sequelize';
import type { TournamentRepository } from '../../shared/repositories/tournament.types';
import { Tournament } from '../../infra/db/models/tournament';

class UpdateTournamentInteractor {
    private tournamentRepository: TournamentRepository;

    constructor(params: { tournamentRepository: TournamentRepository }) {
        this.tournamentRepository = params.tournamentRepository;
    }

    async execute(id: number, input: Partial<CreationAttributes<Tournament>>) {
        return await this.tournamentRepository.update(id, input);
    }

}

export = UpdateTournamentInteractor;
