import type { Sequelize, Transaction } from 'sequelize';
import type { Db } from '../../db/models/models.types';
import type { TransactionManager } from '../../../shared/persistence/transaction-manager.types';

class SequelizeTransactionManager implements TransactionManager {
    private sequelize: Sequelize;

    constructor(params: { models: Db }) {
        this.sequelize = params.models.sequelize;
    }

    async run<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
        return await this.sequelize.transaction(work);
    }
}

export = SequelizeTransactionManager;
