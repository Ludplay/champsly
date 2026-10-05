import { CreationAttributes } from 'sequelize';
import { User } from '../../infra/db/models/user';
import type { TransactionOptions } from '../persistence/transaction-manager.types';

export interface UserRepository {
    findById(id: number): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(data: CreationAttributes<User>, options?: TransactionOptions): Promise<User>;
    update(id: number, data: Partial<CreationAttributes<User>>, options?: TransactionOptions): Promise<User>;
}
