import { CreationAttributes, FindOptions, InferAttributes, Op, literal } from 'sequelize';
import { OutboxMessage } from '../../../infra/db/models/outbox-message';
import type { Db } from '../../../infra/db/models/models.types';
import type { DomainEvent } from '../../../shared/events/domain-event';
import type { OutboxRepository, OutboxRelayRepository } from '../../../shared/repositories/outbox.types';
import type { RequiredTransactionOptions } from '../../../shared/persistence/transaction-manager.types';
import { buildEventRecord } from '../events/event-registry';

class SequelizeOutboxRepository implements OutboxRepository, OutboxRelayRepository {
    private outboxMessageModel: typeof OutboxMessage;

    constructor(params: { models: Db }) {
        this.outboxMessageModel = params.models.OutboxMessage;
    }

    async add(event: DomainEvent, options: RequiredTransactionOptions) {
        const eventRecord = buildEventRecord(event);

        const outboxRow: CreationAttributes<OutboxMessage> = {
            id: event.eventId,
            topic: eventRecord.topic,
            message_key: eventRecord.key,
            event_type: eventRecord.eventType,
            payload: eventRecord.envelope,
            occurred_on: event.occurredOn
        };

        await this.outboxMessageModel.create(outboxRow, options);
    }

    async hasUnpublished() {
        const findOptions: FindOptions<InferAttributes<OutboxMessage>> = {
            attributes: ['id'],
            where: { published_at: null },
            logging: false
        };

        const outboxMessage = await this.outboxMessageModel.findOne(findOptions);

        return outboxMessage !== null;
    }

    async lockUnpublishedBatch(limit: number, options: RequiredTransactionOptions) {
        const findOptions: FindOptions<InferAttributes<OutboxMessage>> = {
            where: { published_at: null },
            order: [['created_at', 'ASC']],
            limit,
            lock: true,
            skipLocked: true,
            transaction: options.transaction
        };

        return await this.outboxMessageModel.findAll(findOptions);
    }

    async markPublished(ids: string[], options: RequiredTransactionOptions) {
        const changes = { published_at: new Date(), attempts: literal('attempts + 1') };
        const updateOptions = { where: { id: ids }, transaction: options.transaction };

        await this.outboxMessageModel.update(changes, updateOptions);
    }

    async recordFailure(ids: string[], errorMessage: string) {
        const changes = { last_error: errorMessage, attempts: literal('attempts + 1') };
        const updateOptions = { where: { id: ids } };

        await this.outboxMessageModel.update(changes, updateOptions);
    }

    async deletePublishedBefore(cutoff: Date) {
        const destroyOptions = { where: { published_at: { [Op.lt]: cutoff } } };

        return await this.outboxMessageModel.destroy(destroyOptions);
    }
}

export = SequelizeOutboxRepository;
