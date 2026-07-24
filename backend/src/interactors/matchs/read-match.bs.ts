import type { MatchRepository } from '../../shared/repositories/match.types';

class ReadMatchInteractor {
    private matchRepository: MatchRepository;

    constructor(params: { matchRepository: MatchRepository }) {
        this.matchRepository = params.matchRepository;
    }

    async execute(id: number) {
        return await this.matchRepository.getOne(id);
    }

}

export = ReadMatchInteractor;
