import type { DomainEvent, DomainEventMetadata } from '../../../shared/events/domain-event';
import type { EventClass } from '../../../shared/events/event-bus.types';
import { TournamentCreated, MatchResultRecorded, MatchDeleted, PhaseCompleted, UserRegistered, GroupStandingsUpdated } from '../../../shared/events';

// An event's own fields after a JSON round-trip — Dates come back as ISO strings.
type SerializedEvent<T extends DomainEvent> = { [K in keyof T]: T[K] extends Date ? string : T[K] };

export interface EventEnvelope<T extends DomainEvent = DomainEvent> {
    schemaVersion: number;
    eventType: string;
    payload: SerializedEvent<T>;
}

// An event resolved against its registration, before the envelope is turned into a message value.
export interface EventRecord {
    topic: string;
    key: string;
    eventType: string;
    envelope: EventEnvelope;
}

export interface EventRegistration<T extends DomainEvent = DomainEvent> {
    eventClass: EventClass<T>;
    topic: string;
    schemaVersion: number;
    // Per-topic Kafka settings on top of the shared defaults, e.g. retention.ms or cleanup.policy.
    topicConfig?: Record<string, string>;
    messageKey(event: T): string;
    rehydrate(payload: SerializedEvent<T>, metadata: DomainEventMetadata): T;
}

export interface SerializedMessage {
    topic: string;
    key: string;
    value: string;
}

export class UnsupportedEventSchemaError extends Error {}

function defineEvent<T extends DomainEvent>(registration: EventRegistration<T>): EventRegistration {
    return registration as unknown as EventRegistration;
}

// Match events are keyed by phase so every result within a phase lands on one partition, in order.
const registrations: EventRegistration[] = [
    defineEvent<TournamentCreated>({
        eventClass: TournamentCreated,
        topic: 'tournament.created',
        schemaVersion: 1,
        messageKey: (event) => String(event.aggregateId),
        rehydrate: (payload, metadata) => new TournamentCreated(Number(payload.aggregateId), payload.name, metadata)
    }),
    defineEvent<MatchResultRecorded>({
        eventClass: MatchResultRecorded,
        topic: 'match.result-recorded',
        schemaVersion: 1,
        topicConfig: { 'retention.ms': '-1' },
        messageKey: (event) => String(event.phaseId),
        rehydrate: (payload, metadata) => new MatchResultRecorded({
            matchId: Number(payload.aggregateId),
            tournamentId: payload.tournamentId,
            phaseId: payload.phaseId,
            groupId: payload.groupId,
            player1Id: payload.player1Id,
            player2Id: payload.player2Id,
            player1Score: payload.player1Score,
            player2Score: payload.player2Score,
            winnerPlayerId: payload.winnerPlayerId
        }, metadata)
    }),
    defineEvent<MatchDeleted>({
        eventClass: MatchDeleted,
        topic: 'match.deleted',
        schemaVersion: 1,
        topicConfig: { 'retention.ms': '-1' },
        messageKey: (event) => String(event.phaseId),
        rehydrate: (payload, metadata) => new MatchDeleted({
            matchId: Number(payload.aggregateId),
            tournamentId: payload.tournamentId,
            phaseId: payload.phaseId,
            groupId: payload.groupId,
            player1Id: payload.player1Id,
            player2Id: payload.player2Id
        }, metadata)
    }),
    defineEvent<PhaseCompleted>({
        eventClass: PhaseCompleted,
        topic: 'phase.completed',
        schemaVersion: 1,
        messageKey: (event) => String(event.aggregateId),
        rehydrate: (payload, metadata) => new PhaseCompleted(Number(payload.aggregateId), payload.tournamentId, metadata)
    }),
    defineEvent<UserRegistered>({
        eventClass: UserRegistered,
        topic: 'user.registered',
        schemaVersion: 1,
        messageKey: (event) => String(event.aggregateId),
        rehydrate: (payload, metadata) => new UserRegistered(Number(payload.aggregateId), metadata)
    }),
    // Compacted: Kafka eventually keeps only the latest snapshot per group.
    defineEvent<GroupStandingsUpdated>({
        eventClass: GroupStandingsUpdated,
        topic: 'group.standings',
        schemaVersion: 1,
        topicConfig: { 'cleanup.policy': 'compact' },
        messageKey: (event) => String(event.aggregateId),
        rehydrate: (payload, metadata) => new GroupStandingsUpdated(Number(payload.aggregateId), payload.standings, metadata)
    })
];

const registrationsByClass = new Map<EventClass<DomainEvent>, EventRegistration>(
    registrations.map((registration) => [registration.eventClass, registration])
);
const registrationsByTopic = new Map<string, EventRegistration>(
    registrations.map((registration) => [registration.topic, registration])
);

export function getAllRegistrations(): EventRegistration[] {
    return registrations;
}

export function getRegistrationByClass(eventClass: EventClass<DomainEvent>): EventRegistration {
    const registration = registrationsByClass.get(eventClass);

    if (!registration) {
        throw new Error(`No topic registered for event ${eventClass.name}`);
    }

    return registration;
}

export function buildEventRecord(event: DomainEvent): EventRecord {
    const eventClass = event.constructor as EventClass<DomainEvent>;
    const registration = getRegistrationByClass(eventClass);

    const envelope: EventEnvelope = {
        schemaVersion: registration.schemaVersion,
        eventType: eventClass.name,
        payload: JSON.parse(JSON.stringify(event))
    };

    return {
        topic: registration.topic,
        key: registration.messageKey(event),
        eventType: eventClass.name,
        envelope
    };
}

export function serializeEvent(event: DomainEvent): SerializedMessage {
    const eventRecord = buildEventRecord(event);

    return {
        topic: eventRecord.topic,
        key: eventRecord.key,
        value: JSON.stringify(eventRecord.envelope)
    };
}

export function deserializeEvent(topic: string, value: string): DomainEvent {
    const registration = registrationsByTopic.get(topic);

    if (!registration) {
        throw new Error(`No event registered for topic ${topic}`);
    }

    const envelope: EventEnvelope = JSON.parse(value);

    if (envelope.schemaVersion !== registration.schemaVersion) {
        throw new UnsupportedEventSchemaError(
            `Unsupported schemaVersion ${envelope.schemaVersion} on ${topic} (expected ${registration.schemaVersion})`
        );
    }

    const metadata: DomainEventMetadata = {
        eventId: envelope.payload.eventId,
        occurredOn: new Date(envelope.payload.occurredOn)
    };

    return registration.rehydrate(envelope.payload, metadata);
}
