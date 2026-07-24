import { CreationAttributes } from 'sequelize';
import type { MatchRepository } from '../../shared/repositories/match.types';
import { Match } from '../../infra/db/models/match';

class UpdateMatchInteractor {
    private matchRepository: MatchRepository;

    constructor(params: { matchRepository: MatchRepository }) {
        this.matchRepository = params.matchRepository;
    }

    async execute(id: number, input: Partial<CreationAttributes<Match>>) {
        return await this.matchRepository.update(id, input);
    }

}

export = UpdateMatchInteractor;
