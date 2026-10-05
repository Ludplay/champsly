import type { EventSubscriber } from '../../../shared/events/event-bus.types';
import type { MatchRepository } from '../../../shared/repositories/match.types';
import type { PhaseRepository } from '../../../shared/repositories/phase.types';
import type { OutboxRepository } from '../../../shared/repositories/outbox.types';
import type { ProcessedEventRepository } from '../../../shared/repositories/processed-event.types';
import type { TransactionManager, RequiredTransactionOptions } from '../../../shared/persistence/transaction-manager.types';
import { MatchResultRecorded, PhaseCompleted } from '../../../shared/events';

class PhaseCompletionConsumer implements EventSubscriber<MatchResultRecorded> {
    static readonly consumerGroup = 'phase-completion';

    private matchRepository: MatchRepository;
    private phaseRepository: PhaseRepository;
    private outboxRepository: OutboxRepository;
    private processedEventRepository: ProcessedEventRepository;
    private transactionManager: TransactionManager;

    constructor(params: {
        matchRepository: MatchRepository;
        phaseRepository: PhaseRepository;
        outboxRepository: OutboxRepository;
        processedEventRepository: ProcessedEventRepository;
        transactionManager: TransactionManager;
    }) {
        this.matchRepository = params.matchRepository;
        this.phaseRepository = params.phaseRepository;
        this.outboxRepository = params.outboxRepository;
        this.processedEventRepository = params.processedEventRepository;
        this.transactionManager = params.transactionManager;
    }

    async handle(event: MatchResultRecorded): Promise<void> {
        const hasUnfinishedMatches = await this.matchRepository.hasUnfinishedMatches(event.phaseId);

        if (hasUnfinishedMatches) {
            return;
        }

        await this.transactionManager.run(async (transaction) => {
            const transactionOptions: RequiredTransactionOptions = { transaction };
            const isFirstDelivery = await this.processedEventRepository.markProcessed(PhaseCompletionConsumer.consumerGroup, event.eventId, transactionOptions);

            if (!isFirstDelivery) {
                return;
            }

            // markFinished only changes a row once, so two different results can't both complete the phase.
            const phaseWasFinished = await this.phaseRepository.markFinished(event.phaseId, transactionOptions);

            if (!phaseWasFinished) {
                return;
            }

            const phaseCompletedEvent = new PhaseCompleted(event.phaseId, event.tournamentId);
            await this.outboxRepository.add(phaseCompletedEvent, transactionOptions);
        });
    }
}

export = PhaseCompletionConsumer;
