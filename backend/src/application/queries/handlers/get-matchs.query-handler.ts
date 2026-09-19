import type { MatchRepository } from '../../../shared/repositories/match.types';
import type { MatchDTO } from '../../dtos/match.dto';
import type { GetMatchsQuery } from '../get-matchs.query';

class GetMatchsQueryHandler {
    private matchRepository: MatchRepository;

    constructor(params: { matchReadRepository: MatchRepository }) {
        this.matchRepository = params.matchReadRepository;
    }

    async execute(query: GetMatchsQuery): Promise<MatchDTO[]> {
        const matches = await this.matchRepository.getAllByUser(query.userId);
        return matches.map((match) => match.toJSON<MatchDTO>());
    }

}

export = GetMatchsQueryHandler;
