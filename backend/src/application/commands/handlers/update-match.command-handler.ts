import type { MatchRepository } from '../../../shared/repositories/match.types';
import type { PhaseRepository } from '../../../shared/repositories/phase.types';
import type { OutboxRepository } from '../../../shared/repositories/outbox.types';
import type { TransactionManager, RequiredTransactionOptions } from '../../../shared/persistence/transaction-manager.types';
import type TournamentOwnershipService from '../../../shared/services/tournament-ownership.service';
import type PlayerOwnershipService from '../../../shared/services/player-ownership.service';
import { Match } from '../../../infra/db/models/match';
import { Phase } from '../../../infra/db/models/phase';
import { Score } from '../../../shared/value-objects';
import { NotFoundError } from '../../../shared/errors';
import { MatchResultRecorded, type MatchResultRecordedProps } from '../../../shared/events';
import type { UpdateMatchCommand } from '../update-match.command';

class UpdateMatchCommandHandler {
    private matchRepository: MatchRepository;
    private phaseRepository: PhaseRepository;
    private outboxRepository: OutboxRepository;
    private transactionManager: TransactionManager;
    private tournamentOwnershipService: TournamentOwnershipService;
    private playerOwnershipService: PlayerOwnershipService;

    constructor(params: {
        matchRepository: MatchRepository;
        phaseRepository: PhaseRepository;
        outboxRepository: OutboxRepository;
        transactionManager: TransactionManager;
        tournamentOwnershipService: TournamentOwnershipService;
        playerOwnershipService: PlayerOwnershipService;
    }) {
        this.matchRepository = params.matchRepository;
        this.phaseRepository = params.phaseRepository;
        this.outboxRepository = params.outboxRepository;
        this.transactionManager = params.transactionManager;
        this.tournamentOwnershipService = params.tournamentOwnershipService;
        this.playerOwnershipService = params.playerOwnershipService;
    }

    // getMatchOwner throws NotFoundError('Match not found') itself when the id doesn't
    // exist, before it even checks ownership — the same error the plain-update path
    // used to get one call later, from matchRepository.update().
    async execute(command: UpdateMatchCommand) {
        const match = await this.tournamentOwnershipService.getMatchOwner(command.id, command.userId);
        let changes = command.changes;

        const changedPlayerIds = [changes.player1_id, changes.player2_id, changes.winner_player_id]
            .filter((playerId): playerId is number => typeof playerId === 'number');
        await this.playerOwnershipService.assertPlayersOwned(changedPlayerIds, command.userId);
        const isRecordingResult = changes.player1_score !== undefined && changes.player2_score !== undefined;

        // Loaded before the transaction so it doesn't hold a second pool connection while one is open.
        const phase = isRecordingResult ? await this.getPhase(match.phase_id) : null;

        if (isRecordingResult) {
            match.recordResult(new Score(changes.player1_score as number, changes.player2_score as number));

            changes = {
                ...changes,
                status: match.status,
                winner_player_id: match.winner_player_id
            };
        }

        return await this.transactionManager.run(async (transaction) => {
            const transactionOptions: RequiredTransactionOptions = { transaction };
            const updatedMatch = await this.matchRepository.update(command.id, changes, transactionOptions);

            if (phase) {
                await this.addResultRecorded(updatedMatch, phase, transactionOptions);
            }

            return updatedMatch;
        });
    }

    private async getPhase(phaseId: number): Promise<Phase> {
        const phase = await this.phaseRepository.getOne(phaseId);

        if (!phase) {
            throw new NotFoundError('Phase not found');
        }

        return phase;
    }

    private async addResultRecorded(match: Match, phase: Phase, transactionOptions: RequiredTransactionOptions): Promise<void> {
        const eventProps: MatchResultRecordedProps = {
            matchId: match.id,
            tournamentId: phase.tournament_id,
            phaseId: match.phase_id,
            groupId: match.group_id,
            player1Id: match.player1_id,
            player2Id: match.player2_id,
            player1Score: match.player1_score,
            player2Score: match.player2_score,
            winnerPlayerId: match.winner_player_id
        };

        const matchResultRecordedEvent = new MatchResultRecorded(eventProps);
        await this.outboxRepository.add(matchResultRecordedEvent, transactionOptions);
    }

}

export = UpdateMatchCommandHandler;
