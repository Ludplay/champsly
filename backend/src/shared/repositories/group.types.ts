import { CreationAttributes, InferAttributes } from 'sequelize';
import { Player } from '../../infra/db/models/player';
import { Group } from '../../infra/db/models/group';

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
    getTournamentGroups(tournamentId: number): Promise<GroupWithPlayers[]>;
    getOne(id: number): Promise<Group | null>;
    create(data: CreationAttributes<Group>): Promise<Group>;
    update(id: number, data: Partial<CreationAttributes<Group>>): Promise<Group>;
    delete(id: number): Promise<number>;
    addPlayerInGroup(playerId: number, groupId: number): Promise<[number, number]>;
}
