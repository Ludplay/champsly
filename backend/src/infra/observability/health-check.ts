import type { Admin } from 'kafkajs';
import type { Db } from '../db/models/models.types';
import { createKafkaClient } from '../adapters/events/kafka-client';
import logger from '../config/logger';

const CHECK_TIMEOUT_MS = 2000;
const NO_RETRIES = 0;

type DependencyStatus = 'up' | 'down' | 'disabled';

export interface ReadinessReport {
    status: 'ready' | 'not_ready';
    checks: {
        database: DependencyStatus;
        readDatabase: DependencyStatus;
        kafka: DependencyStatus;
    };
}

function withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
    const timeout = new Promise<never>((_, reject) => {
        const timer = setTimeout(() => reject(new Error(`Timed out after ${timeoutMs}ms`)), timeoutMs);

        timer.unref();
    });

    return Promise.race([operation, timeout]);
}

/**
 * Only the databases decide readiness. Kafka is reported but never fails it: the outbox keeps
 * writes working while Kafka is down, so pulling the instance from traffic would cause an outage.
 */
class HealthCheck {
    private models: Db;
    private readModels: Db;
    private kafkaAdmin: Admin | null;
    private logger: typeof logger;

    constructor(params: { models: Db; readModels: Db; logger: typeof logger }) {
        this.models = params.models;
        this.readModels = params.readModels;
        this.logger = params.logger;

        // Tests run without a broker.
        const isTestEnvironment = process.env.NODE_ENV === 'test';

        // Fails fast instead of retrying, so a probe never outlives its timeout.
        const adminOptions = { retry: { retries: NO_RETRIES } };
        this.kafkaAdmin = isTestEnvironment ? null : createKafkaClient(params.logger).admin(adminOptions);
    }

    async checkReadiness(): Promise<ReadinessReport> {
        const [database, readDatabase, kafka] = await Promise.all([
            this.checkDatabase('database', this.models),
            this.checkDatabase('readDatabase', this.readModels),
            this.checkKafka()
        ]);

        const databasesUp = database === 'up' && readDatabase === 'up';

        return {
            status: databasesUp ? 'ready' : 'not_ready',
            checks: { database, readDatabase, kafka }
        };
    }

    async stop(): Promise<void> {
        await this.kafkaAdmin?.disconnect();
    }

    private async checkDatabase(name: string, models: Db): Promise<DependencyStatus> {
        const queryOptions = { logging: false };

        try {
            await withTimeout(models.sequelize.query('SELECT 1', queryOptions), CHECK_TIMEOUT_MS);

            return 'up';
        } catch (error) {
            this.logger.warn({ err: error, dependency: name }, 'Health check failed');

            return 'down';
        }
    }

    private async checkKafka(): Promise<DependencyStatus> {
        const kafkaAdmin = this.kafkaAdmin;

        if (!kafkaAdmin) {
            return 'disabled';
        }

        try {
            // connect() is a no-op once connected, and reconnects after a broker outage.
            const describeCluster = async () => {
                await kafkaAdmin.connect();
                await kafkaAdmin.describeCluster();
            };

            await withTimeout(describeCluster(), CHECK_TIMEOUT_MS);

            return 'up';
        } catch (error) {
            this.logger.warn({ err: error, dependency: 'kafka' }, 'Health check failed');

            return 'down';
        }
    }
}

export default HealthCheck;
