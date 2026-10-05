import { CreationAttributes, InferAttributes } from 'sequelize';
import { Player } from '../../infra/db/models/player';
import { Group } from '../../infra/db/models/group';
import type { TransactionOptions } from '../persistence/transaction-manager.types';

export interface PlayerStats {
    wins: number;
    points: number;
}

export type GroupWithPlayers = InferAttributes<Group> & {
    Players: InferAttributes<Player>[];
};

export type PlayerWithStats = InferAttributes<Player> & PlayerStats;

export type GroupWithStats = InferAttributes<Group> & {
    Players: PlayerWithStats[];
};

export interface GroupRepository {
    getAll(): Promise<Group[]>;
    getAllByUser(userId: number): Promise<Group[]>;
    getTournamentGroups(tournamentId: number): Promise<GroupWithPlayers[]>;
    getOne(id: number): Promise<Group | null>;
    create(data: CreationAttributes<Group>, options?: TransactionOptions): Promise<Group>;
    update(id: number, data: Partial<CreationAttributes<Group>>, options?: TransactionOptions): Promise<Group>;
    delete(id: number, options?: TransactionOptions): Promise<number>;
    addPlayerInGroup(playerId: number, groupId: number, options?: TransactionOptions): Promise<[number, number]>;
}

// Additive read-only subset (4.1) (architecture-evolution.md)
export interface GroupReadRepository {
    getAll(): Promise<Group[]>;
    getAllByUser(userId: number): Promise<Group[]>;
    getOne(id: number): Promise<Group | null>;
    getTournamentGroups(tournamentId: number): Promise<GroupWithPlayers[]>;
}
