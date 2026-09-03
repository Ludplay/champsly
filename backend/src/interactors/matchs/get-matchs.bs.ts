import type { MatchRepository } from '../../shared/repositories/match.types';

class GetMatchsInteractor {
    private matchRepository: MatchRepository;

    constructor(params: { matchRepository: MatchRepository }) {
        this.matchRepository = params.matchRepository;
    }

    async execute(userId: number) {
        return await this.matchRepository.getAllByUser(userId);
    }

}

export = GetMatchsInteractor;
