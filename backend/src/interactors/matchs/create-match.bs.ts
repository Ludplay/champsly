import { CreationAttributes } from 'sequelize';
import type { MatchRepository } from '../../shared/repositories/match.types';
import type TournamentOwnershipService from '../../shared/services/tournament-ownership.service';
import { Match } from '../../infra/db/models/match';
import { isMatchStatus } from '../../shared/value-objects';
import { ValidationError } from '../../shared/errors';

class CreateMatchInteractor {
    private matchRepository: MatchRepository;
    private tournamentOwnershipService: TournamentOwnershipService;

    constructor(params: {
        matchRepository: MatchRepository;
        tournamentOwnershipService: TournamentOwnershipService;
    }) {
        this.matchRepository = params.matchRepository;
        this.tournamentOwnershipService = params.tournamentOwnershipService;
    }

    async execute(input: Pick<CreationAttributes<Match>, 'phase_id' | 'group_id' | 'round_number' | 'player1_id' | 'player2_id'> & { status: string }, userId: number) {
        const { phase_id, group_id, round_number, player1_id, player2_id, status } = input;

        if (!isMatchStatus(status)) {
            throw new ValidationError(`Invalid match status: ${status}`);
        }

        await this.tournamentOwnershipService.getPhaseOwner(phase_id, userId);

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
