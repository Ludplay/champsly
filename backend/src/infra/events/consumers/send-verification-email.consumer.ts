import type { EventSubscriber } from '../../../shared/events/event-bus.types';
import type { UserRepository } from '../../../shared/repositories/user.types';
import type { ProcessedEventRepository } from '../../../shared/repositories/processed-event.types';
import type { TransactionManager, RequiredTransactionOptions } from '../../../shared/persistence/transaction-manager.types';
import type VerificationEmailService from '../../../shared/services/verification-email.service';
import { AccountStatus } from '../../../shared/value-objects';
import { UserRegistered } from '../../../shared/events';

class SendVerificationEmailConsumer implements EventSubscriber<UserRegistered> {
    static readonly consumerGroup = 'send-verification-email';

    private userRepository: UserRepository;
    private verificationEmailService: VerificationEmailService;
    private processedEventRepository: ProcessedEventRepository;
    private transactionManager: TransactionManager;

    constructor(params: {
        userRepository: UserRepository;
        verificationEmailService: VerificationEmailService;
        processedEventRepository: ProcessedEventRepository;
        transactionManager: TransactionManager;
    }) {
        this.userRepository = params.userRepository;
        this.verificationEmailService = params.verificationEmailService;
        this.processedEventRepository = params.processedEventRepository;
        this.transactionManager = params.transactionManager;
    }

    async handle(event: UserRegistered): Promise<void> {
        const user = await this.userRepository.findById(Number(event.aggregateId));

        if (!user || user.status !== AccountStatus.PendingVerification) {
            return;
        }

        // The email goes out before the commit: a failed send rolls back the token and the
        // processed record, so the retry sends again instead of skipping a lost email.
        await this.transactionManager.run(async (transaction) => {
            const transactionOptions: RequiredTransactionOptions = { transaction };
            const isFirstDelivery = await this.processedEventRepository.markProcessed(SendVerificationEmailConsumer.consumerGroup, event.eventId, transactionOptions);

            if (!isFirstDelivery) {
                return;
            }

            await this.verificationEmailService.send(user, transactionOptions);
        });
    }
}

export = SendVerificationEmailConsumer;
