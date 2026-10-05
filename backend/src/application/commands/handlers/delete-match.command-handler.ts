import type { MatchRepository } from '../../../shared/repositories/match.types';
import type { PhaseRepository } from '../../../shared/repositories/phase.types';
import type { OutboxRepository } from '../../../shared/repositories/outbox.types';
import type { TransactionManager, RequiredTransactionOptions } from '../../../shared/persistence/transaction-manager.types';
import type TournamentOwnershipService from '../../../shared/services/tournament-ownership.service';
import { NotFoundError } from '../../../shared/errors';
import { MatchDeleted, type MatchEventContext } from '../../../shared/events';
import type { DeleteMatchCommand } from '../delete-match.command';

class DeleteMatchCommandHandler {
    private matchRepository: MatchRepository;
    private phaseRepository: PhaseRepository;
    private outboxRepository: OutboxRepository;
    private transactionManager: TransactionManager;
    private tournamentOwnershipService: TournamentOwnershipService;

    constructor(params: {
        matchRepository: MatchRepository;
        phaseRepository: PhaseRepository;
        outboxRepository: OutboxRepository;
        transactionManager: TransactionManager;
        tournamentOwnershipService: TournamentOwnershipService;
    }) {
        this.matchRepository = params.matchRepository;
        this.phaseRepository = params.phaseRepository;
        this.outboxRepository = params.outboxRepository;
        this.transactionManager = params.transactionManager;
        this.tournamentOwnershipService = params.tournamentOwnershipService;
    }

    async execute(command: DeleteMatchCommand) {
        const match = await this.tournamentOwnershipService.getMatchOwner(command.id, command.userId);
        const phase = await this.phaseRepository.getOne(match.phase_id);

        if (!phase) {
            throw new NotFoundError('Phase not found');
        }

        // Captured before the delete: the row is gone afterwards.
        const eventContext: MatchEventContext = {
            matchId: match.id,
            tournamentId: phase.tournament_id,
            phaseId: match.phase_id,
            groupId: match.group_id,
            player1Id: match.player1_id,
            player2Id: match.player2_id
        };

        return await this.transactionManager.run(async (transaction) => {
            const transactionOptions: RequiredTransactionOptions = { transaction };
            const deletedCount = await this.matchRepository.delete(command.id, transactionOptions);

            const matchDeletedEvent = new MatchDeleted(eventContext);
            await this.outboxRepository.add(matchDeletedEvent, transactionOptions);

            return deletedCount;
        });
    }

}

export = DeleteMatchCommandHandler;
