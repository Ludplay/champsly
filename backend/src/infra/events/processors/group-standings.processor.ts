import { randomUUID } from 'crypto';
import { Partitioners, type Consumer, type EachMessagePayload, type IMemberAssignment, type Kafka, type Message, type Producer, type Transaction } from 'kafkajs';
import type { DomainEvent } from '../../../shared/events/domain-event';
import { MatchResultRecorded, MatchDeleted, GroupStandingsUpdated } from '../../../shared/events';
import { accumulateStandings, type StandingsMatchResult } from '../../../shared/services/group-standings.service';
import { getRegistrationByClass, serializeEvent, deserializeEvent } from '../../adapters/events/event-registry';
import { createKafkaClient, buildTopicConfig, createMissingTopics, DEAD_LETTER_SUFFIX } from '../../adapters/events/kafka-client';
import logger from '../../config/logger';

const PROCESSOR_GROUP_ID = 'group-standings-processor';
const CHANGELOG_TOPIC = 'group-standings-processor.match-results-changelog';
const INPUT_TOPICS = [getRegistrationByClass(MatchResultRecorded).topic, getRegistrationByClass(MatchDeleted).topic];

interface StoredMatchResult extends StandingsMatchResult {
    groupId: number | null;
}

/**
 * Turns the match result log into per-group standings snapshots.
 *
 * State store: the latest result per match, in memory, backed by a compacted changelog topic.
 * Each changelog record goes to the same partition number as the input record that produced
 * it, so the owner of input partition p only needs changelog partition p to rebuild its state.
 *
 * Exactly-once: the changelog record, the snapshot and the input offset commit are written in
 * one Kafka transaction, so a crash never leaves the store and the output out of step.
 * The single static transactionalId is only safe while one instance runs.
 */
class GroupStandingsProcessor {
    static readonly groupId = PROCESSOR_GROUP_ID;
    static readonly changelogTopic = CHANGELOG_TOPIC;
    static readonly inputTopics = INPUT_TOPICS;

    private kafka: Kafka;
    private producer: Producer;
    private consumer: Consumer;
    private store: Map<number, StoredMatchResult>;
    private restoring: Promise<void>;
    private logger: typeof logger;

    constructor(params: { logger: typeof logger }) {
        this.logger = params.logger;
        this.store = new Map();
        this.restoring = Promise.resolve();
        this.kafka = createKafkaClient(params.logger);

        this.producer = this.kafka.producer({
            transactionalId: PROCESSOR_GROUP_ID,
            idempotent: true,
            maxInFlightRequests: 1,
            createPartitioner: Partitioners.DefaultPartitioner
        });

        this.consumer = this.kafka.consumer({ groupId: PROCESSOR_GROUP_ID, readUncommitted: false });
    }

    async start(): Promise<void> {
        await this.prepareChangelogTopic();

        // Connecting a transactional producer fences any previous instance and aborts its open transaction.
        await this.producer.connect();

        // Every (re)assignment rebuilds the store for exactly the partitions now owned.
        this.consumer.on(this.consumer.events.GROUP_JOIN, (event) => {
            const restore = this.restoreStore(event.payload.memberAssignment);

            restore.catch((error) => this.logger.error({ err: error }, 'Group standings state store restore failed'));
            this.restoring = restore;
        });

        await this.consumer.connect();
        await this.consumer.subscribe({ topics: INPUT_TOPICS, fromBeginning: true });
        await this.consumer.run({
            autoCommit: false,
            eachMessage: (payload) => this.processMessage(payload)
        });
    }

    async stop(): Promise<void> {
        await this.consumer.disconnect();
        await this.producer.disconnect();
    }

    private async prepareChangelogTopic(): Promise<void> {
        const admin = this.kafka.admin();

        await admin.connect();

        try {
            const changelogConfig = buildTopicConfig(CHANGELOG_TOPIC, { 'cleanup.policy': 'compact' });
            await createMissingTopics(admin, [changelogConfig]);

            const metadata = await admin.fetchTopicMetadata({ topics: [...INPUT_TOPICS, CHANGELOG_TOPIC] });
            const partitionCounts = metadata.topics.map((topic) => `${topic.name}=${topic.partitions.length}`);
            const distinctCounts = new Set(metadata.topics.map((topic) => topic.partitions.length));

            if (distinctCounts.size !== 1) {
                throw new Error(`Input and changelog topics must have the same partition count: ${partitionCounts.join(', ')}`);
            }
        } finally {
            await admin.disconnect();
        }
    }

    // kafkajs can't assign partitions directly, so a throwaway consumer group reads the changelog;
    // records from partitions this instance doesn't own are ignored.
    private async restoreStore(assignment: IMemberAssignment): Promise<void> {
        const ownedPartitions = new Set(INPUT_TOPICS.flatMap((topic) => assignment[topic] ?? []));
        const restoredStore = new Map<number, StoredMatchResult>();
        const targetOffsets = await this.fetchChangelogEndOffsets(ownedPartitions);

        if (targetOffsets.size > 0) {
            await this.readChangelog(targetOffsets, restoredStore);
        }

        this.store = restoredStore;
        this.logger.info({ partitions: [...ownedPartitions], matches: restoredStore.size }, 'Group standings state store restored');
    }

    // Only non-empty owned partitions need reading; each is done once its end offset is reached.
    private async fetchChangelogEndOffsets(ownedPartitions: Set<number>): Promise<Map<number, number>> {
        const admin = this.kafka.admin();

        await admin.connect();

        try {
            const partitionOffsets = await admin.fetchTopicOffsets(CHANGELOG_TOPIC);
            const targetOffsets = new Map<number, number>();

            for (const { partition, low, high } of partitionOffsets) {
                if (ownedPartitions.has(partition) && Number(high) > Number(low)) {
                    targetOffsets.set(partition, Number(high));
                }
            }

            return targetOffsets;
        } finally {
            await admin.disconnect();
        }
    }

    private async readChangelog(targetOffsets: Map<number, number>, restoredStore: Map<number, StoredMatchResult>): Promise<void> {
        const restoreGroupId = `${PROCESSOR_GROUP_ID}-restore-${randomUUID()}`;
        // A short fetch wait: disconnect waits for the in-flight fetch, and the default 5 s would stall every restore.
        const restoreConsumer = this.kafka.consumer({ groupId: restoreGroupId, readUncommitted: false, maxWaitTimeInMs: 100 });
        const pendingPartitions = new Set(targetOffsets.keys());
        let markCaughtUp: () => void = () => {};
        const caughtUp = new Promise<void>((resolve) => {
            markCaughtUp = resolve;
        });

        // Emitted even for batches holding only transaction markers, whose offsets count towards the end.
        restoreConsumer.on(restoreConsumer.events.END_BATCH_PROCESS, (event) => {
            const { partition, lastOffset } = event.payload;
            const targetOffset = targetOffsets.get(partition);

            if (targetOffset !== undefined && Number(lastOffset) + 1 >= targetOffset) {
                pendingPartitions.delete(partition);
            }

            if (pendingPartitions.size === 0) {
                markCaughtUp();
            }
        });

        try {
            await restoreConsumer.connect();
            await restoreConsumer.subscribe({ topics: [CHANGELOG_TOPIC], fromBeginning: true });
            await restoreConsumer.run({
                autoCommit: false,
                eachMessage: async ({ partition, message }) => {
                    if (!targetOffsets.has(partition) || !message.key) {
                        return;
                    }

                    const matchId = Number(message.key.toString());

                    if (message.value === null) {
                        restoredStore.delete(matchId);
                    } else {
                        restoredStore.set(matchId, JSON.parse(message.value.toString()));
                    }
                }
            });

            await caughtUp;
        } finally {
            await restoreConsumer.disconnect();
            await this.deleteConsumerGroup(restoreGroupId);
        }
    }

    private async deleteConsumerGroup(groupId: string): Promise<void> {
        const admin = this.kafka.admin();

        try {
            await admin.connect();
            await admin.deleteGroups([groupId]);
        } catch (error) {
            this.logger.warn({ err: error, groupId }, 'Could not delete temporary consumer group');
        } finally {
            await admin.disconnect();
        }
    }

    private async processMessage({ topic, partition, message }: EachMessagePayload): Promise<void> {
        await this.restoring;

        const nextOffset = String(Number(message.offset) + 1);
        const transaction = await this.producer.transaction();

        try {
            let event: DomainEvent | null = null;
            let deserializationError: unknown = null;
            let applyToStore = (): void => {};

            try {
                event = deserializeEvent(topic, message.value?.toString() ?? '');
            } catch (error) {
                deserializationError = error;
            }

            // Only unreadable messages are parked; a failed Kafka write aborts and the message is retried.
            if (event) {
                applyToStore = await this.writeOutputs(transaction, partition, event);
            } else {
                await this.sendToDeadLetter(transaction, topic, partition, message, deserializationError);
            }

            const offsetsToCommit = {
                consumerGroupId: PROCESSOR_GROUP_ID,
                topics: [{ topic, partitions: [{ partition, offset: nextOffset }] }]
            };

            await transaction.sendOffsets(offsetsToCommit);
            await transaction.commit();

            // Only after the commit: an aborted transaction must leave the in-memory store untouched.
            applyToStore();
        } catch (error) {
            await transaction.abort();
            throw error;
        }
    }

    // Writes the changelog record and the affected group's snapshot; returns the matching store update.
    private async writeOutputs(transaction: Transaction, partition: number, event: DomainEvent): Promise<() => void> {
        const matchId = Number(event.aggregateId);
        let changelogRecord: Message;
        let groupId: number | null;
        let groupResults: StandingsMatchResult[];
        let applyToStore: () => void;

        if (event instanceof MatchResultRecorded) {
            const result: StoredMatchResult = {
                groupId: event.groupId,
                player1Id: event.player1Id,
                player2Id: event.player2Id,
                player1Score: event.player1Score,
                player2Score: event.player2Score,
                winnerPlayerId: event.winnerPlayerId
            };

            changelogRecord = { key: String(matchId), value: JSON.stringify(result), partition };
            groupId = event.groupId;
            groupResults = [...this.otherResultsInGroup(groupId, matchId), result];
            applyToStore = () => this.store.set(matchId, result);
        } else if (event instanceof MatchDeleted) {
            changelogRecord = { key: String(matchId), value: null, partition };
            groupId = event.groupId;
            groupResults = this.otherResultsInGroup(groupId, matchId);
            applyToStore = () => this.store.delete(matchId);
        } else {
            throw new Error(`Unexpected event ${event.constructor.name} on group standings input`);
        }

        await transaction.send({ topic: CHANGELOG_TOPIC, messages: [changelogRecord] });

        // Knockout matches have no group, so they only update the store.
        if (groupId !== null) {
            const standings = accumulateStandings(groupResults);
            const snapshot = serializeEvent(new GroupStandingsUpdated(groupId, standings));

            await transaction.send({ topic: snapshot.topic, messages: [{ key: snapshot.key, value: snapshot.value }] });

            this.logger.info({ groupId, matchId, eventType: event.constructor.name, players: standings.length }, 'Group standings snapshot produced');
        }

        return applyToStore;
    }

    private otherResultsInGroup(groupId: number | null, excludedMatchId: number): StoredMatchResult[] {
        const results: StoredMatchResult[] = [];

        for (const [matchId, result] of this.store) {
            if (matchId !== excludedMatchId && result.groupId === groupId) {
                results.push(result);
            }
        }

        return results;
    }

    private async sendToDeadLetter(transaction: Transaction, topic: string, partition: number, message: EachMessagePayload['message'], error: unknown): Promise<void> {
        const errorMessage = error instanceof Error ? error.message : String(error);

        this.logger.error({ err: error, topic, partition, offset: message.offset }, 'Sending message to dead-letter topic');

        const deadLetterHeaders = {
            ...message.headers,
            'dlq-error': errorMessage,
            'dlq-consumer-group': PROCESSOR_GROUP_ID,
            'dlq-source-topic': topic,
            'dlq-source-partition': String(partition),
            'dlq-source-offset': message.offset
        };

        await transaction.send({
            topic: topic + DEAD_LETTER_SUFFIX,
            messages: [{ key: message.key, value: message.value, headers: deadLetterHeaders }]
        });
    }
}

export = GroupStandingsProcessor;
