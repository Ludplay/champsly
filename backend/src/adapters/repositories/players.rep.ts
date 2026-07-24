import { CreationAttributes } from 'sequelize';
import { NotFoundError } from '../../shared/errors';
import { Player } from '../../infra/db/models/player';
import type { Db } from '../../infra/db/models/models.types';
import type { PlayerRepository } from '../../shared/repositories/player.types';

class SequelizePlayerRepository implements PlayerRepository {
    private playerModel: typeof Player;

    constructor(params: { models: Db }) {
        this.playerModel = params.models.Player;
    }

    async getAll() {
        return await this.playerModel.findAll();
    }

    async getOne(id: number) {
        return await this.playerModel.findByPk(id);
    }

    async create(data: CreationAttributes<Player>) {
        return await this.playerModel.create(data);
    }

    async update(id: number, data: Partial<CreationAttributes<Player>>) {
        const player = await this.playerModel.findByPk(id);
        if (player) {
            await player.update(data);
            return player;
        } else {
            throw new NotFoundError('Player not found');
        }
    }

    async delete(id: number) {
        return await this.playerModel.destroy({ where: { id } });
    }
}

export = SequelizePlayerRepository;
