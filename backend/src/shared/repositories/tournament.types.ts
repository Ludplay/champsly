import { CreationAttributes } from 'sequelize';
import { Tournament } from '../../infra/db/models/tournament';

export interface TournamentRepository {
    getAll(): Promise<Tournament[]>;
    getAllByUser(userId: number): Promise<Tournament[]>;
    getOne(id: number): Promise<Tournament | null>;
    create(data: CreationAttributes<Tournament>): Promise<Tournament>;
    update(id: number, data: Partial<CreationAttributes<Tournament>>): Promise<Tournament>;
    delete(id: number): Promise<number>;
}
