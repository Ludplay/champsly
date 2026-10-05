import type { AwilixContainer } from 'awilix';
import type { DomainEvent } from '../../shared/events/domain-event';
import type { DomainEventHandler, EventSubscriber } from '../../shared/events/event-bus.types';
import type { Cradle } from '../config/register';

type SubscriberToken<T extends DomainEvent> = {
    [K in keyof Cradle]: Cradle[K] extends EventSubscriber<T> ? K : never
}[keyof Cradle];

// Each event gets its own DI scope, like an HTTP request, so scoped repositories aren't shared across events.
export function scopedEventHandler<T extends DomainEvent>(container: AwilixContainer<Cradle>, token: SubscriberToken<T>): DomainEventHandler<T> {
    return async (event: T) => {
        const scope = container.createScope();

        try {
            const subscriber = scope.resolve(token) as EventSubscriber<T>;
            await subscriber.handle(event);
        } finally {
            await scope.dispose();
        }
    };
}
