import type { Transaction } from 'sequelize';

export interface TransactionOptions {
    transaction?: Transaction;
}

// For writes that are only correct inside a caller's transaction (e.g. an outbox row next to its aggregate).
export type RequiredTransactionOptions = Required<TransactionOptions>;

export interface TransactionManager {
    // Commits when work resolves, rolls back when it throws.
    run<T>(work: (transaction: Transaction) => Promise<T>): Promise<T>;
}
