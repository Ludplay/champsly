import { CreationAttributes } from 'sequelize';
import { Match } from '../../infra/db/models/match';

export interface MatchRepository {
    getAll(): Promise<Match[]>;
    getAllByUser(userId: number): Promise<Match[]>;
    getTournamentMatches(tournamentId: number): Promise<Match[]>;
    getOne(id: number): Promise<Match | null>;
    create(data: CreationAttributes<Match>): Promise<Match>;
    update(id: number, data: Partial<CreationAttributes<Match>>): Promise<Match>;
    delete(id: number): Promise<number>;
    phaseMatchesExist(phaseId: number): Promise<Match | null>;
    createMany(data: CreationAttributes<Match>[]): Promise<Match[]>;
    getMatchesByGroupIds(groupIds: number[]): Promise<Match[]>;
}
