import type { DomainEvent } from '../events/domain-event';
import type { OutboxMessage } from '../../infra/db/models/outbox-message';
import type { RequiredTransactionOptions } from '../persistence/transaction-manager.types';

export interface OutboxRepository {
    // Must share the aggregate's transaction: the event is stored only if the change it announces commits.
    add(event: DomainEvent, options: RequiredTransactionOptions): Promise<void>;
}

export interface OutboxRelayRepository {
    // Unlocked and unlogged: lets an idle poll skip opening a transaction.
    hasUnpublished(): Promise<boolean>;
    // Oldest unpublished rows, locked FOR UPDATE SKIP LOCKED so concurrent relays never take the same row.
    lockUnpublishedBatch(limit: number, options: RequiredTransactionOptions): Promise<OutboxMessage[]>;
    markPublished(ids: string[], options: RequiredTransactionOptions): Promise<void>;
    recordFailure(ids: string[], errorMessage: string): Promise<void>;
    deletePublishedBefore(cutoff: Date): Promise<number>;
}
