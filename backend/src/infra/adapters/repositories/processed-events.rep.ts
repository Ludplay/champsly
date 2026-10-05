import { QueryTypes } from 'sequelize';
import { ProcessedEvent } from '../../../infra/db/models/processed-event';
import type { Db } from '../../../infra/db/models/models.types';
import type { ProcessedEventRepository } from '../../../shared/repositories/processed-event.types';
import type { RequiredTransactionOptions } from '../../../shared/persistence/transaction-manager.types';

class SequelizeProcessedEventRepository implements ProcessedEventRepository {
    private processedEventModel: typeof ProcessedEvent;

    constructor(params: { models: Db }) {
        this.processedEventModel = params.models.ProcessedEvent;
    }

    // ON CONFLICT DO NOTHING keeps the transaction usable on a duplicate, and a concurrent
    // redelivery blocks on the primary key until this transaction commits or rolls back.
    async markProcessed(consumerGroup: string, eventId: string, options: RequiredTransactionOptions) {
        const sql = `INSERT INTO processed_events (consumer_group, event_id, processed_at) VALUES (:consumerGroup, :eventId, now()) ON CONFLICT DO NOTHING`;

        const queryOptions = {
            replacements: { consumerGroup, eventId },
            type: QueryTypes.INSERT as const,
            transaction: options.transaction
        };

        const [, insertedCount] = await this.processedEventModel.sequelize!.query(sql, queryOptions);

        return insertedCount > 0;
    }
}

export = SequelizeProcessedEventRepository;
