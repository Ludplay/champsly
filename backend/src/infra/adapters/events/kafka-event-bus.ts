import { setTimeout as sleep } from 'timers/promises';
import { Partitioners, type Consumer, type EachMessagePayload, type ITopicConfig, type Kafka, type Producer } from 'kafkajs';
import type { DomainEvent } from '../../../shared/events/domain-event';
import type { EventBus, DomainEventHandler, EventClass } from '../../../shared/events/event-bus.types';
import { getAllRegistrations, getRegistrationByClass, serializeEvent, deserializeEvent } from './event-registry';
import { createKafkaClient, buildTopicConfig, createMissingTopics, DEAD_LETTER_SUFFIX } from './kafka-client';
import logger from '../../config/logger';

const HANDLER_MAX_ATTEMPTS = 5;
const HANDLER_RETRY_BASE_DELAY_MS = 200;

type KafkaMessage = EachMessagePayload['message'];

class KafkaEventBus implements EventBus {
    private kafka: Kafka;
    private producer: Producer;
    private consumers: Consumer[];
    // subscriberName (consumer group id) → topic → handler
    private subscriptions: Map<string, Map<string, DomainEventHandler>>;
    private started: boolean;
    private logger: typeof logger;

    constructor(params: { logger: typeof logger }) {
        this.logger = params.logger;
        this.consumers = [];
        this.subscriptions = new Map();
        this.started = false;

        this.kafka = createKafkaClient(params.logger);

        this.producer = this.kafka.producer({
            idempotent: true,
            maxInFlightRequests: 1,
            createPartitioner: Partitioners.DefaultPartitioner
        });
    }

    subscribe<T extends DomainEvent>(subscriberName: string, eventClass: EventClass<T>, handler: DomainEventHandler<T>): void {
        if (this.started) {
            throw new Error(`Cannot subscribe ${subscriberName} after the event bus has started`);
        }

        const { topic } = getRegistrationByClass(eventClass);
        const subscriberTopics = this.subscriptions.get(subscriberName) || new Map<string, DomainEventHandler>();

        if (subscriberTopics.has(topic)) {
            throw new Error(`${subscriberName} is already subscribed to ${topic}`);
        }

        subscriberTopics.set(topic, handler as DomainEventHandler);
        this.subscriptions.set(subscriberName, subscriberTopics);
    }

    async start(): Promise<void> {
        await this.createTopics();
        await this.producer.connect();

        for (const [groupId, handlersByTopic] of this.subscriptions) {
            // read_committed: never see records from aborted (or still open) producer transactions.
            const consumer = this.kafka.consumer({ groupId, readUncommitted: false });

            await consumer.connect();
            await consumer.subscribe({ topics: [...handlersByTopic.keys()], fromBeginning: true });
            await consumer.run({
                eachMessage: (payload) => this.handleMessage(groupId, handlersByTopic, payload)
            });

            this.consumers.push(consumer);
        }

        this.started = true;
    }

    async stop(): Promise<void> {
        await Promise.all(this.consumers.map((consumer) => consumer.disconnect()));
        await this.producer.disconnect();
    }

    async publish(event: DomainEvent): Promise<void> {
        const { topic, key, value } = serializeEvent(event);

        await this.producer.send({ topic, acks: -1, messages: [{ key, value }] });

        this.logger.debug({ topic, eventId: event.eventId, aggregateId: event.aggregateId }, 'Published domain event');
    }

    private async createTopics(): Promise<void> {
        const topics: ITopicConfig[] = [];

        for (const registration of getAllRegistrations()) {
            topics.push(buildTopicConfig(registration.topic, registration.topicConfig));
            topics.push(buildTopicConfig(registration.topic + DEAD_LETTER_SUFFIX));
        }

        const admin = this.kafka.admin();

        await admin.connect();

        try {
            await createMissingTopics(admin, topics);
        } finally {
            await admin.disconnect();
        }
    }

    // Never throws for a bad message or a failing handler: either succeeds or parks the message
    // in the DLQ, so the offset is committed and the partition keeps moving.
    private async handleMessage(groupId: string, handlersByTopic: Map<string, DomainEventHandler>, payload: EachMessagePayload): Promise<void> {
        const { topic, partition, message, heartbeat } = payload;
        const handler = handlersByTopic.get(topic) as DomainEventHandler;
        let event: DomainEvent;

        try {
            event = deserializeEvent(topic, message.value?.toString() ?? '');
        } catch (error) {
            await this.sendToDeadLetter(groupId, topic, partition, message, error);
            return;
        }

        for (let attempt = 1; ; attempt++) {
            try {
                await handler(event);
                return;
            } catch (error) {
                if (attempt >= HANDLER_MAX_ATTEMPTS) {
                    await this.sendToDeadLetter(groupId, topic, partition, message, error);
                    return;
                }

                const delayMs = HANDLER_RETRY_BASE_DELAY_MS * 2 ** (attempt - 1);

                this.logger.warn({ err: error, groupId, topic, eventId: event.eventId, attempt, delayMs }, 'Event handler failed, retrying');

                await sleep(delayMs);
                await heartbeat();
            }
        }
    }

    private async sendToDeadLetter(groupId: string, topic: string, partition: number, message: KafkaMessage, error: unknown): Promise<void> {
        const errorMessage = error instanceof Error ? error.message : String(error);

        this.logger.error({ err: error, groupId, topic, partition, offset: message.offset }, 'Sending message to dead-letter topic');

        const deadLetterHeaders = {
            ...message.headers,
            'dlq-error': errorMessage,
            'dlq-consumer-group': groupId,
            'dlq-source-topic': topic,
            'dlq-source-partition': String(partition),
            'dlq-source-offset': message.offset
        };

        await this.producer.send({
            topic: topic + DEAD_LETTER_SUFFIX,
            acks: -1,
            messages: [{ key: message.key, value: message.value, headers: deadLetterHeaders }]
        });
    }
}

export = KafkaEventBus;
