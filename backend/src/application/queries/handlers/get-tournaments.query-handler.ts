import type { TournamentRepository } from '../../../shared/repositories/tournament.types';
import type { TournamentDTO } from '../../dtos/tournament.dto';
import type { GetTournamentsQuery } from '../get-tournaments.query';
import logger from '../../../infra/config/logger';

class GetTournamentsQueryHandler {
    private tournamentRepository: TournamentRepository;
    private logger: typeof logger;

    constructor(params: { tournamentReadRepository: TournamentRepository; logger: typeof logger }) {
        this.tournamentRepository = params.tournamentReadRepository;
        this.logger = params.logger;
    }

    async execute(query: GetTournamentsQuery): Promise<TournamentDTO[]> {
        const tournaments = await this.tournamentRepository.getAllByUser(query.userId);

        this.logger.debug({ tournaments }, 'Fetched tournaments');

        return tournaments.map((tournament) => tournament.toJSON<TournamentDTO>());
    }

}

export = GetTournamentsQueryHandler;
