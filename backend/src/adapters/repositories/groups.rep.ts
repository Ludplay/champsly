import { CreationAttributes, QueryTypes } from 'sequelize';
import { NotFoundError } from '../../shared/errors';
import { Group } from '../../infra/db/models/group';
import { Player } from '../../infra/db/models/player';
import type { Db } from '../../infra/db/models/models.types';
import type { GroupWithPlayers, GroupRepository } from '../../shared/repositories/group.types';

class SequelizeGroupRepository implements GroupRepository {
    private groupModel: typeof Group;
    private playerModel: typeof Player;

    constructor(params: { models: Db }) {
        this.groupModel = params.models.Group;
        this.playerModel = params.models.Player;
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

    async getAllByUser(userId: number) {
        const options = {
            include: [
                { model: this.playerModel, as: 'Players' },
                { association: 'Tournament', attributes: [], where: { user_id: userId } }
            ]
        };

        return await this.groupModel.findAll(options);
    }

    async getTournamentGroups(tournamentId: number): Promise<GroupWithPlayers[]> {
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

        return groups.map((group) => group.toJSON<GroupWithPlayers>());
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
