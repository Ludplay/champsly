import { CreationAttributes } from 'sequelize';
import { Phase } from '../../infra/db/models/phase';
import type { TransactionOptions } from '../persistence/transaction-manager.types';

export interface PhaseRepository {
    getAll(): Promise<Phase[]>;
    getAllByUser(userId: number): Promise<Phase[]>;
    getOne(id: number): Promise<Phase | null>;
    create(data: CreationAttributes<Phase>, options?: TransactionOptions): Promise<Phase>;
    update(id: number, data: Partial<CreationAttributes<Phase>>, options?: TransactionOptions): Promise<Phase>;
    delete(id: number, options?: TransactionOptions): Promise<number>;
    getTournamentPhases(tournamentId: number): Promise<Phase[]>;
    getTournamentGroupsPhase(tournamentId: number): Promise<Phase | null>;
    // Like getOne, but with the Tournament association loaded for display.
    getOneWithTournament(id: number): Promise<Phase | null>;
    // Conditional update; resolves false when the phase was already finished (or doesn't exist).
    markFinished(id: number, options?: TransactionOptions): Promise<boolean>;
}
