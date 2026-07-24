import { CreationAttributes, QueryTypes, InferAttributes } from 'sequelize';
import { NotFoundError } from '../../shared/errors';
import { Group } from '../../infra/db/models/group';
import { Player } from '../../infra/db/models/player';
import { Match } from '../../infra/db/models/match';
import type { Db } from '../../infra/db/models/models.types';
import type { PlayerStats, PlayerWithStats, GroupWithStats, GroupRepository } from '../../shared/repositories/group.types';

class SequelizeGroupRepository implements GroupRepository {
    private groupModel: typeof Group;
    private playerModel: typeof Player;
    private matchModel: typeof Match;

    constructor(params: { models: Db }) {
        this.groupModel = params.models.Group;
        this.playerModel = params.models.Player;
        this.matchModel = params.models.Match;
    }

    async getAll() {
        const options = {
            include: [{
                model: this.playerModel,
                as: 'Players'
            }]
        };

        return await this.groupModel.findAll(options);
    }

    async getTournamentGroups(tournamentId: number): Promise<GroupWithStats[]> {
        const options = {
            include: [{
                model: this.playerModel,
                as: 'Players'
            }],
            where: {
                tournament_id: tournamentId
            }
        };

        const groups = await this.groupModel.findAll(options);
        const groupIds = groups.map((group) => group.id);

        if (!groupIds.length) {
            return [];
        }

        const matches = await this.matchModel.findAll({
            where: {
                group_id: groupIds
            }
        });

        const statsByGroup = matches.reduce((acc: Record<number, Record<number, PlayerStats>>, match) => {
            const groupId = match.group_id as number;
            const groupStats = acc[groupId] || {};

            const ensurePlayer = (playerId: number) => {
                if (!groupStats[playerId]) {
                    groupStats[playerId] = { wins: 0, points: 0 };
                }
                return groupStats[playerId];
            };

            const player1Stats = ensurePlayer(match.player1_id);
            const player2Stats = ensurePlayer(match.player2_id);

            player1Stats.points += Number(match.player1_score) || 0;
            player2Stats.points += Number(match.player2_score) || 0;

            if (match.winner_player_id) {
                ensurePlayer(match.winner_player_id).wins += 1;
            }

            acc[groupId] = groupStats;
            return acc;
        }, {});

        return groups.map((group): GroupWithStats => {
            const groupStats = statsByGroup[group.id] || {};
            const playersWithStats: PlayerWithStats[] = (group.Players || []).map((player) => ({
                ...player.toJSON<InferAttributes<Player>>(),
                wins: groupStats[player.id]?.wins || 0,
                points: groupStats[player.id]?.points || 0
            }));

            const groupJson = group.toJSON<GroupWithStats>();
            groupJson.Players = playersWithStats;
            return groupJson;
        });
    }

    async getOne(id: number) {
        const options = {
            include: [{
                model: this.playerModel,
                as: 'Players'
            }]
        };

        return await this.groupModel.findByPk(id, options);
    }

    async create(data: CreationAttributes<Group>) {
        return await this.groupModel.create(data);
    }

    async update(id: number, data: Partial<CreationAttributes<Group>>) {
        const group = await this.groupModel.findByPk(id);
        if (group) {
            await group.update(data);
            return group;
        } else {
            throw new NotFoundError('Group not found');
        }
    }

    async delete(id: number) {
        return await this.groupModel.destroy({ where: { id } });
    }

    async addPlayerInGroup(playerId: number, groupId: number) {
        const sql = `INSERT INTO groups_players (player_id, group_id, created_at, updated_at) VALUES (:playerId, :groupId, now(), now())`;

        return await this.groupModel.sequelize!.query(sql, {
            replacements: {
                playerId,
                groupId
            },
            type: QueryTypes.INSERT,
        });
    }
}

export = SequelizeGroupRepository;
