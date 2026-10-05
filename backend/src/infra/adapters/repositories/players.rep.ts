import { CreationAttributes, Op } from 'sequelize';
import { NotFoundError } from '../../../shared/errors';
import { Player } from '../../../infra/db/models/player';
import type { Db } from '../../../infra/db/models/models.types';
import type { PlayerRepository } from '../../../shared/repositories/player.types';
import type { TransactionOptions } from '../../../shared/persistence/transaction-manager.types';

class SequelizePlayerRepository implements PlayerRepository {
    private playerModel: typeof Player;

    constructor(params: { models: Db }) {
        this.playerModel = params.models.Player;
    }

    async getAllByUser(userId: number) {
        const options = { where: { user_id: userId } };

        return await this.playerModel.findAll(options);
    }

    async countOwnedByUser(ids: number[], userId: number) {
        const options = { where: { id: { [Op.in]: ids }, user_id: userId } };

        return await this.playerModel.count(options);
    }

    async getOne(id: number) {
        return await this.playerModel.findByPk(id);
    }

    async create(data: CreationAttributes<Player>, options: TransactionOptions = {}) {
        return await this.playerModel.create(data, options);
    }

    async update(id: number, data: Partial<CreationAttributes<Player>>, options: TransactionOptions = {}) {
        const player = await this.playerModel.findByPk(id, options);
        if (player) {
            await player.update(data, options);
            return player;
        } else {
            throw new NotFoundError('Player not found');
        }
    }

    async delete(id: number, options: TransactionOptions = {}) {
        const destroyOptions = { where: { id }, transaction: options.transaction };

        return await this.playerModel.destroy(destroyOptions);
    }
}

export = SequelizePlayerRepository;
