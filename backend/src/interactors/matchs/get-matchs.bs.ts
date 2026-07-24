import type { MatchRepository } from '../../shared/repositories/match.types';

class GetMatchsInteractor {
    private matchRepository: MatchRepository;

    constructor(params: { matchRepository: MatchRepository }) {
        this.matchRepository = params.matchRepository;
    }

    async execute() {
        return await this.matchRepository.getAll();
    }

}

export = GetMatchsInteractor;
