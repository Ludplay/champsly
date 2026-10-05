import { CreationAttributes, QueryTypes } from 'sequelize';
import { NotFoundError } from '../../../shared/errors';
import { Group } from '../../../infra/db/models/group';
import { Player } from '../../../infra/db/models/player';
import type { Db } from '../../../infra/db/models/models.types';
import type { GroupWithPlayers, GroupRepository, GroupReadRepository } from '../../../shared/repositories/group.types';
import type { TransactionOptions } from '../../../shared/persistence/transaction-manager.types';

class SequelizeGroupRepository implements GroupRepository, GroupReadRepository {
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

    async create(data: CreationAttributes<Group>, options: TransactionOptions = {}) {
        return await this.groupModel.create(data, options);
    }

    async update(id: number, data: Partial<CreationAttributes<Group>>, options: TransactionOptions = {}) {
        const group = await this.groupModel.findByPk(id, options);
        if (group) {
            await group.update(data, options);
            return group;
        } else {
            throw new NotFoundError('Group not found');
        }
    }

    async delete(id: number, options: TransactionOptions = {}) {
        const destroyOptions = { where: { id }, transaction: options.transaction };

        return await this.groupModel.destroy(destroyOptions);
    }

    async addPlayerInGroup(playerId: number, groupId: number, options: TransactionOptions = {}) {
        const sql = `INSERT INTO groups_players (player_id, group_id, created_at, updated_at) VALUES (:playerId, :groupId, now(), now())`;

        return await this.groupModel.sequelize!.query(sql, {
            replacements: {
                playerId,
                groupId
            },
            type: QueryTypes.INSERT,
            transaction: options.transaction
        });
    }
}

export = SequelizeGroupRepository;
