import type { TournamentRepository } from '../../shared/repositories/tournament.types';
import logger from '../../infra/config/logger';

class GetTournamentsInteractor {
    private tournamentRepository: TournamentRepository;
    private logger: typeof logger;

    constructor(params: { tournamentRepository: TournamentRepository; logger: typeof logger }) {
        this.tournamentRepository = params.tournamentRepository;
        this.logger = params.logger;
    }

    async execute() {

        const tournaments = await this.tournamentRepository.getAll();

        this.logger.debug({ tournaments }, 'Fetched tournaments');

        return tournaments;
    }

}

export = GetTournamentsInteractor;
