import { CreationAttributes } from 'sequelize';
import { Match } from '../../infra/db/models/match';
import type { TransactionOptions } from '../persistence/transaction-manager.types';

export interface MatchRepository {
    getAll(): Promise<Match[]>;
    getAllByUser(userId: number): Promise<Match[]>;
    getTournamentMatches(tournamentId: number): Promise<Match[]>;
    getOne(id: number): Promise<Match | null>;
    create(data: CreationAttributes<Match>, options?: TransactionOptions): Promise<Match>;
    update(id: number, data: Partial<CreationAttributes<Match>>, options?: TransactionOptions): Promise<Match>;
    delete(id: number, options?: TransactionOptions): Promise<number>;
    phaseMatchesExist(phaseId: number): Promise<Match | null>;
    hasUnfinishedMatches(phaseId: number): Promise<boolean>;
    createMany(data: CreationAttributes<Match>[], options?: TransactionOptions): Promise<Match[]>;
}
