import { setTimeout as sleep } from 'timers/promises';
import { Kafka, logLevel, type Admin, type ITopicConfig, type LogEntry } from 'kafkajs';
import logger from '../../config/logger';

const TOPIC_PARTITIONS = 3;
export const DEAD_LETTER_SUFFIX = '.dlq';
const TOPIC_REPLICATION_FACTOR = 3;
const TOPIC_MIN_INSYNC_REPLICAS = '2';

const PINO_LEVELS = {
    [logLevel.NOTHING]: 'silent',
    [logLevel.ERROR]: 'error',
    [logLevel.WARN]: 'warn',
    [logLevel.INFO]: 'info',
    [logLevel.DEBUG]: 'debug'
} as const;

// Every topic gets the same partitioning and durability; extraConfig adds per-topic settings
// such as retention.ms or cleanup.policy.
export function buildTopicConfig(topic: string, extraConfig: Record<string, string> = {}): ITopicConfig {
    const configEntries = Object.entries({ 'min.insync.replicas': TOPIC_MIN_INSYNC_REPLICAS, ...extraConfig })
        .map(([name, value]) => ({ name, value }));

    return {
        topic,
        numPartitions: TOPIC_PARTITIONS,
        replicationFactor: TOPIC_REPLICATION_FACTOR,
        configEntries
    };
}

const TOPIC_READY_TIMEOUT_MS = 30000;
const TOPIC_READY_POLL_MS = 250;

/**
 * Creates the topics that don't exist yet and waits until every partition has a leader.
 * kafkajs's own waitForLeaders gives up when a broker briefly reports a just-created topic
 * as unknown, which KRaft does right after creation.
 */
export async function createMissingTopics(admin: Admin, topics: ITopicConfig[]): Promise<void> {
    const existingTopics = new Set(await admin.listTopics());
    const missingTopics = topics.filter((topicConfig) => !existingTopics.has(topicConfig.topic));

    if (missingTopics.length === 0) {
        return;
    }

    await admin.createTopics({ topics: missingTopics, waitForLeaders: false });

    const topicNames = missingTopics.map((topicConfig) => topicConfig.topic);
    const deadline = Date.now() + TOPIC_READY_TIMEOUT_MS;

    while (true) {
        try {
            const metadata = await admin.fetchTopicMetadata({ topics: topicNames });
            const allLeadersElected = metadata.topics.every((topic) => topic.partitions.every((partition) => partition.leader >= 0));

            if (allLeadersElected) {
                return;
            }
        } catch (error) {
            if (Date.now() > deadline) {
                throw error;
            }
        }

        if (Date.now() > deadline) {
            throw new Error(`Timed out waiting for partition leaders of ${topicNames.join(', ')}`);
        }

        await sleep(TOPIC_READY_POLL_MS);
    }
}

export function createKafkaClient(appLogger: typeof logger): Kafka {
    const brokers = process.env.KAFKA_BROKERS;

    if (!brokers) {
        throw new Error('KAFKA_BROKERS environment variable is required');
    }

    const logKafkaEntry = ({ namespace, level, log }: LogEntry): void => {
        const { message, ...extra } = log;
        const pinoLevel = PINO_LEVELS[level];

        if (pinoLevel === 'silent') {
            return;
        }

        appLogger[pinoLevel]({ component: 'kafkajs', namespace, ...extra }, message);
    };

    return new Kafka({
        clientId: process.env.KAFKA_CLIENT_ID || 'champsly-backend',
        brokers: brokers.split(','),
        logCreator: () => logKafkaEntry
    });
}
