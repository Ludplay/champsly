/**
 * Publishes MatchResultRecorded once for every finished match, so the group standings
 * processor can build standings for results recorded before it existed.
 * Safe to re-run: the processor keeps the latest result per match, so duplicates change nothing.
 *
 * Run (backend running or not):
 *   docker compose exec champsly-backend npx tsx scripts/backfill-match-result-events.ts
 */

import dotenv from 'dotenv';
dotenv.config({ quiet: true });

import KafkaEventBus from '../src/infra/adapters/events/kafka-event-bus';
import logger from '../src/infra/config/logger';
import models from '../src/infra/db/models';
import { MatchResultRecorded, type MatchResultRecordedProps } from '../src/shared/events';
import { MatchStatus } from '../src/shared/value-objects';

async function main(): Promise<void> {
    const { db, readDb } = models;
    const eventBus = new KafkaEventBus({ logger });

    const options = {
        where: { status: MatchStatus.Finished },
        include: [{ model: db.Phase, as: 'Phase', attributes: ['tournament_id'] }],
        order: [['id', 'ASC']] as [string, string][]
    };

    const finishedMatches = await db.Match.findAll(options);

    await eventBus.start();

    try {
        for (const match of finishedMatches) {
            const eventProps: MatchResultRecordedProps = {
                matchId: match.id,
                tournamentId: match.Phase!.tournament_id,
                phaseId: match.phase_id,
                groupId: match.group_id,
                player1Id: match.player1_id,
                player2Id: match.player2_id,
                player1Score: match.player1_score,
                player2Score: match.player2_score,
                winnerPlayerId: match.winner_player_id
            };

            await eventBus.publish(new MatchResultRecorded(eventProps));
            console.log(`published MatchResultRecorded for match ${match.id} (phase ${match.phase_id}, group ${match.group_id})`);
        }

        console.log(`\nDone: ${finishedMatches.length} event(s) published.`);
    } finally {
        await eventBus.stop();
        await db.sequelize.close();
        await readDb.sequelize.close();
    }
}

main().catch((error) => {
    console.error('Backfill failed:', error);
    process.exitCode = 1;
});
