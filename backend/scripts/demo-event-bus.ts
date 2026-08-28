/**
 * Throwaway demo script — NOT part of the app, not registered anywhere.
 * Run it to watch the InMemoryEventBus pub/sub cycle end-to-end with logs
 * at every step: construction, subscription, publish, and what each
 * handler actually receives.
 *
 * Run (from backend/, inside the container so it uses the real deps volume):
 *   docker compose exec champsly-backend npx tsx scripts/demo-event-bus.ts
 *
 * Or on the host if you have node_modules installed locally:
 *   npx tsx scripts/demo-event-bus.ts
 */

import InMemoryEventBus = require('../src/infra/events/in-memory-event-bus');
import logger = require('../src/infra/config/logger');
import { TournamentCreated, MatchResultRecorded } from '../src/shared/events';

// Bump to debug so the bus's own internal log line (in publish()) is visible —
// by default the app runs at 'info' and would swallow it.
logger.level = 'debug';

function step(n: number, msg: string): void {
    console.log(`\n[STEP ${n}] ${msg}`);
}

async function main(): Promise<void> {
    step(1, 'Constructing InMemoryEventBus');
    const eventBus = new InMemoryEventBus({ logger });
    console.log('  -> bus created, no subscribers yet');

    step(2, 'Subscribing a handler to TournamentCreated');
    eventBus.subscribe(TournamentCreated, (event) => {
        console.log('  [HANDLER #1 fired] TournamentCreated received:');
        console.log(`    eventId:     ${event.eventId}`);
        console.log(`    occurredOn:  ${event.occurredOn.toISOString()}`);
        console.log(`    aggregateId: ${event.aggregateId}`);
        console.log(`    name:        ${event.name}`);
    });
    console.log('  -> handler #1 registered for TournamentCreated');

    step(3, 'Subscribing a second, independent handler to the same event');
    eventBus.subscribe(TournamentCreated, (event) => {
        console.log(`  [HANDLER #2 fired] would e.g. send a welcome email for tournament #${event.aggregateId}`);
    });
    console.log('  -> handler #2 registered for TournamentCreated (proves fan-out, not just single-subscriber)');

    step(4, 'Publishing a TournamentCreated event — mirrors CreateTournamentInteractor:');
    console.log("    await this.eventBus.publish(new TournamentCreated(tournament.id, tournament.name));");
    const created = new TournamentCreated(42, 'Summer Cup 2026');
    await eventBus.publish(created);
    console.log('  -> publish() resolved (both handlers ran, in registration order, awaited sequentially)');

    step(5, 'Publishing MatchResultRecorded — an event class with ZERO subscribers');
    await eventBus.publish(new MatchResultRecorded(7, 12, 8, 101));
    console.log('  -> publish() resolved silently: no handler map entry, the for-loop body never ran, no throw');

    step(6, 'Done. Confirms: construction -> subscribe (N handlers, in-order) -> publish -> await each handler -> no-op when unsubscribed.');
}

main().catch((err) => {
    console.error('Demo script crashed:', err);
    process.exitCode = 1;
});
