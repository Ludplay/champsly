import { CreationAttributes } from 'sequelize';
import { Phase } from '../../infra/db/models/phase';

export interface PhaseRepository {
    getAll(): Promise<Phase[]>;
    getAllByUser(userId: number): Promise<Phase[]>;
    getOne(id: number): Promise<Phase | null>;
    create(data: CreationAttributes<Phase>): Promise<Phase>;
    update(id: number, data: Partial<CreationAttributes<Phase>>): Promise<Phase>;
    delete(id: number): Promise<number>;
    getTournamentPhases(tournamentId: number): Promise<Phase[]>;
    getTournamentGroupsPhase(tournamentId: number): Promise<Phase | null>;
}
