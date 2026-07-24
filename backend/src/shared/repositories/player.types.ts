import { CreationAttributes } from 'sequelize';
import { Player } from '../../infra/db/models/player';

export interface PlayerRepository {
    getAll(): Promise<Player[]>;
    getOne(id: number): Promise<Player | null>;
    create(data: CreationAttributes<Player>): Promise<Player>;
    update(id: number, data: Partial<CreationAttributes<Player>>): Promise<Player>;
    delete(id: number): Promise<number>;
}
