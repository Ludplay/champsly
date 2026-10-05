/**
 * Rebuilds group standings from scratch out of the match event log.
 *
 * The backend must be stopped first: Kafka refuses to reset offsets of a group with live members.
 *   docker compose stop champsly-backend
 *   docker compose run --rm --no-deps champsly-backend npx tsx scripts/rebuild-group-standings.ts
 *   docker compose start champsly-backend    # the processor replays the log and rebuilds
 */

import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import GroupStandingsProcessor from '../src/infra/events/processors/group-standings.processor';
import logger from '../src/infra/config/logger';
import models from '../src/infra/db/models';
import { createKafkaClient } from '../src/infra/adapters/events/kafka-client';

const PROJECTION_GROUP_ID = 'group-standings-projection';
const SNAPSHOT_TOPIC = 'group.standings';

async function main(): Promise<void> {
    const { db, readDb } = models;
    const admin = createKafkaClient(logger).admin();

    await admin.connect();

    try {
        const { groups } = await admin.describeGroups([GroupStandingsProcessor.groupId, PROJECTION_GROUP_ID]);
        const activeGroups = groups.filter((group) => group.members.length > 0).map((group) => group.groupId);

        if (activeGroups.length > 0) {
            throw new Error(`Consumer groups still have live members (${activeGroups.join(', ')}). Stop the backend first.`);
        }

        for (const topic of GroupStandingsProcessor.inputTopics) {
            await admin.resetOffsets({ groupId: GroupStandingsProcessor.groupId, topic, earliest: true });
            console.log(`reset ${GroupStandingsProcessor.groupId} to earliest on ${topic}`);
        }

        // Its offsets point into the snapshot topic deleted below, so it restarts from the beginning of the new one.
        await admin.deleteGroups([PROJECTION_GROUP_ID]).catch(() => undefined);
        console.log(`deleted consumer group ${PROJECTION_GROUP_ID}`);

        const existingTopics = new Set(await admin.listTopics());
        const topicsToDelete = [GroupStandingsProcessor.changelogTopic, SNAPSHOT_TOPIC].filter((topic) => existingTopics.has(topic));

        if (topicsToDelete.length > 0) {
            await admin.deleteTopics({ topics: topicsToDelete });
            console.log(`deleted topics ${topicsToDelete.join(', ')}`);
        }

        await db.GroupStanding.truncate();
        console.log('truncated group_standings');

        console.log('\nDone. Start the backend: the processor recreates its topics and replays every match event.');
    } finally {
        await admin.disconnect();
        await db.sequelize.close();
        await readDb.sequelize.close();
    }
}

main().catch((error) => {
    console.error('Rebuild failed:', error);
    process.exitCode = 1;
});
