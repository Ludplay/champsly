import { CreationAttributes } from 'sequelize';
import { User } from '../../infra/db/models/user';

export interface UserRepository {
    findById(id: number): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(data: CreationAttributes<User>): Promise<User>;
    update(id: number, data: Partial<CreationAttributes<User>>): Promise<User>;
}
