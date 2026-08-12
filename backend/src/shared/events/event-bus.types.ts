import type { DomainEvent } from './domain-event';

export type DomainEventHandler<T extends DomainEvent = DomainEvent> = (event: T) => void | Promise<void>;

// "A reference to a class that builds a T" — e.g. the value `TournamentCreated` itself,
// not an instance of it. Named so `subscribe`'s signature reads instead of having to be parsed.
export type EventClass<T extends DomainEvent> = new (...args: any[]) => T;

export interface EventBus {
    publish(event: DomainEvent): Promise<void>;
    subscribe<T extends DomainEvent>(eventClass: EventClass<T>, handler: DomainEventHandler<T>): void;
}
