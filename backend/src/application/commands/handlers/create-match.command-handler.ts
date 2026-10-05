import type { MatchRepository } from '../../../shared/repositories/match.types';
import type TournamentOwnershipService from '../../../shared/services/tournament-ownership.service';
import type PlayerOwnershipService from '../../../shared/services/player-ownership.service';
import { isMatchStatus } from '../../../shared/value-objects';
import { ValidationError } from '../../../shared/errors';
import type { CreateMatchCommand } from '../create-match.command';

class CreateMatchCommandHandler {
    private matchRepository: MatchRepository;
    private tournamentOwnershipService: TournamentOwnershipService;
    private playerOwnershipService: PlayerOwnershipService;

    constructor(params: {
        matchRepository: MatchRepository;
        tournamentOwnershipService: TournamentOwnershipService;
        playerOwnershipService: PlayerOwnershipService;
    }) {
        this.matchRepository = params.matchRepository;
        this.tournamentOwnershipService = params.tournamentOwnershipService;
        this.playerOwnershipService = params.playerOwnershipService;
    }

    async execute(command: CreateMatchCommand) {
        const { phase_id, group_id, round_number, player1_id, player2_id, status, userId } = command;

        if (!isMatchStatus(status)) {
            throw new ValidationError(`Invalid match status: ${status}`);
        }

        await this.tournamentOwnershipService.getPhaseOwner(phase_id, userId);

        const matchPlayerIds = [player1_id, player2_id];
        await this.playerOwnershipService.assertPlayersOwned(matchPlayerIds, userId);

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

export = CreateMatchCommandHandler;
