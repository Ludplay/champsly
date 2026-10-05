import { setTimeout as sleep } from 'timers/promises';
import { Partitioners, type Message, type Producer, type TopicMessages } from 'kafkajs';
import type { TransactionManager } from '../../shared/persistence/transaction-manager.types';
import type { OutboxRelayRepository } from '../../shared/repositories/outbox.types';
import type { OutboxMessage } from '../db/models/outbox-message';
import { createKafkaClient } from '../adapters/events/kafka-client';
import logger from '../config/logger';

const BATCH_SIZE = 100;
const POLL_INTERVAL_MS = 500;
const MAX_FAILURE_BACKOFF_MS = 30000;
const PUBLISHED_RETENTION_DAYS = 7;
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Polls the outbox and publishes committed events to Kafka. Delivery is at-least-once:
 * a crash between the send and the commit republishes the batch, so consumers deduplicate by eventId.
 */
class OutboxRelay {
    private producer: Producer;
    private transactionManager: TransactionManager;
    private outboxRelayRepository: OutboxRelayRepository;
    private logger: typeof logger;
    private running: boolean;
    private pollLoop: Promise<void> | null;
    private cleanupTimer: NodeJS.Timeout | null;
    private stopSignal: AbortController;

    constructor(params: {
        transactionManager: TransactionManager;
        outboxRelayRepository: OutboxRelayRepository;
        logger: typeof logger;
    }) {
        this.transactionManager = params.transactionManager;
        this.outboxRelayRepository = params.outboxRelayRepository;
        this.logger = params.logger;
        this.running = false;
        this.pollLoop = null;
        this.cleanupTimer = null;
        this.stopSignal = new AbortController();

        const kafka = createKafkaClient(params.logger);

        // Not idempotent: kafkajs's idempotent producer retries forever, which would hold the batch's
        // row locks for a whole broker outage. A send that fails here rolls back and is retried with backoff.
        this.producer = kafka.producer({
            maxInFlightRequests: 1,
            createPartitioner: Partitioners.DefaultPartitioner
        });
    }

    async start(): Promise<void> {
        await this.producer.connect();

        this.running = true;
        this.pollLoop = this.poll();

        this.cleanupTimer = setInterval(() => void this.deleteOldPublished(), CLEANUP_INTERVAL_MS);
        void this.deleteOldPublished();
    }

    async stop(): Promise<void> {
        this.running = false;
        this.stopSignal.abort();

        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }

        await this.pollLoop;
        await this.producer.disconnect();
    }

    private async poll(): Promise<void> {
        let consecutiveFailures = 0;

        while (this.running) {
            let relayedCount = 0;

            try {
                relayedCount = await this.relayBatch();

                if (consecutiveFailures > 0) {
                    this.logger.info({ consecutiveFailures }, 'Outbox relay recovered');
                }

                consecutiveFailures = 0;
            } catch (error) {
                consecutiveFailures++;
                this.logger.error({ err: error, consecutiveFailures }, 'Outbox relay batch failed');
            }

            // A full batch means more rows are probably waiting.
            if (relayedCount === BATCH_SIZE) {
                continue;
            }

            const delayMs = consecutiveFailures === 0
                ? POLL_INTERVAL_MS
                : Math.min(POLL_INTERVAL_MS * 2 ** consecutiveFailures, MAX_FAILURE_BACKOFF_MS);

            await this.idle(delayMs);
        }
    }

    // Rows stay locked until the batch is acknowledged by Kafka and marked published in the same transaction.
    private async relayBatch(): Promise<number> {
        const hasUnpublished = await this.outboxRelayRepository.hasUnpublished();

        if (!hasUnpublished) {
            return 0;
        }

        let lockedIds: string[] = [];

        try {
            return await this.transactionManager.run(async (transaction) => {
                const transactionOptions = { transaction };
                const outboxMessages = await this.outboxRelayRepository.lockUnpublishedBatch(BATCH_SIZE, transactionOptions);

                if (outboxMessages.length === 0) {
                    return 0;
                }

                lockedIds = outboxMessages.map((outboxMessage) => outboxMessage.id);

                await this.send(outboxMessages);
                await this.outboxRelayRepository.markPublished(lockedIds, transactionOptions);

                const eventTypes = outboxMessages.map((outboxMessage) => outboxMessage.event_type);
                this.logger.info({ count: outboxMessages.length, eventTypes }, 'Relayed outbox batch');

                return outboxMessages.length;
            });
        } catch (error) {
            await this.recordFailure(lockedIds, error);
            throw error;
        }
    }

    // Grouped per topic in outbox order; with one request in flight, each partition keeps that order.
    private async send(outboxMessages: OutboxMessage[]): Promise<void> {
        const messagesByTopic = new Map<string, Message[]>();

        for (const outboxMessage of outboxMessages) {
            const message: Message = {
                key: outboxMessage.message_key,
                value: JSON.stringify(outboxMessage.payload)
            };
            const topicMessages = messagesByTopic.get(outboxMessage.topic) || [];

            topicMessages.push(message);
            messagesByTopic.set(outboxMessage.topic, topicMessages);
        }

        const topicMessages: TopicMessages[] = [...messagesByTopic].map(([topic, messages]) => ({ topic, messages }));

        await this.producer.sendBatch({ topicMessages, acks: -1 });
    }

    private async recordFailure(ids: string[], error: unknown): Promise<void> {
        if (ids.length === 0) {
            return;
        }

        const errorMessage = error instanceof Error ? error.message : String(error);

        try {
            await this.outboxRelayRepository.recordFailure(ids, errorMessage);
        } catch (recordError) {
            this.logger.warn({ err: recordError }, 'Could not record outbox failure');
        }
    }

    private async deleteOldPublished(): Promise<void> {
        const cutoff = new Date(Date.now() - PUBLISHED_RETENTION_DAYS * DAY_MS);

        try {
            const deletedCount = await this.outboxRelayRepository.deletePublishedBefore(cutoff);

            if (deletedCount > 0) {
                this.logger.info({ deletedCount, cutoff }, 'Deleted published outbox rows');
            }
        } catch (error) {
            this.logger.warn({ err: error }, 'Outbox cleanup failed');
        }
    }

    private async idle(delayMs: number): Promise<void> {
        try {
            await sleep(delayMs, undefined, { signal: this.stopSignal.signal });
        } catch {
            // Aborted by stop().
        }
    }
}

export = OutboxRelay;
