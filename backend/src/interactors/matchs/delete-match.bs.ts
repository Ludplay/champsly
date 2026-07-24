import type { MatchRepository } from '../../shared/repositories/match.types';

class DeleteMatchInteractor {
    private matchRepository: MatchRepository;

    constructor(params: { matchRepository: MatchRepository }) {
        this.matchRepository = params.matchRepository;
    }

    async execute(id: number) {
        return await this.matchRepository.delete(id);
    }

}

export = DeleteMatchInteractor;
