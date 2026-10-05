import { CreationAttributes } from 'sequelize';
import { Tournament } from '../../infra/db/models/tournament';
import type { TransactionOptions } from '../persistence/transaction-manager.types';

export interface TournamentRepository {
    getAll(): Promise<Tournament[]>;
    getAllByUser(userId: number): Promise<Tournament[]>;
    getOne(id: number): Promise<Tournament | null>;
    create(data: CreationAttributes<Tournament>, options?: TransactionOptions): Promise<Tournament>;
    update(id: number, data: Partial<CreationAttributes<Tournament>>, options?: TransactionOptions): Promise<Tournament>;
    delete(id: number, options?: TransactionOptions): Promise<number>;
}
