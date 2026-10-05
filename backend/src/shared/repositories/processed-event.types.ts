import type { RequiredTransactionOptions } from '../persistence/transaction-manager.types';

export interface ProcessedEventRepository {
    // Resolves false when the consumer group already recorded this event, i.e. it is a redelivery.
    markProcessed(consumerGroup: string, eventId: string, options: RequiredTransactionOptions): Promise<boolean>;
}
