import { CreationAttributes } from 'sequelize';
import { Player } from '../../infra/db/models/player';
import type { TransactionOptions } from '../persistence/transaction-manager.types';

export interface PlayerRepository {
    getAllByUser(userId: number): Promise<Player[]>;
    countOwnedByUser(ids: number[], userId: number): Promise<number>;
    getOne(id: number): Promise<Player | null>;
    create(data: CreationAttributes<Player>, options?: TransactionOptions): Promise<Player>;
    update(id: number, data: Partial<CreationAttributes<Player>>, options?: TransactionOptions): Promise<Player>;
    delete(id: number, options?: TransactionOptions): Promise<number>;
}
