import { CreationAttributes } from 'sequelize';
import type { MatchRepository } from '../../shared/repositories/match.types';
import { Match } from '../../infra/db/models/match';

class CreateMatchInteractor {
    private matchRepository: MatchRepository;

    constructor(params: { matchRepository: MatchRepository }) {
        this.matchRepository = params.matchRepository;
    }

    async execute(input: Pick<CreationAttributes<Match>, 'phase_id' | 'group_id' | 'round_number' | 'player1_id' | 'player2_id' | 'status'>) {
        const { phase_id, group_id, round_number, player1_id, player2_id, status } = input;

        const inputRecord = {
            phase_id,
            group_id,
            round_number,
            player1_id,
            player2_id,
            status,
            player1_score: 0,
            player2_score: 0
        };

        return await this.matchRepository.create(inputRecord);
    }

}

export = CreateMatchInteractor;
