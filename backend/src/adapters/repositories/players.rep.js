const Module = require("node:module");
const { NotFoundError } = require('../../shared/errors');

class PlayerRepository {

    constructor(params) {
        this.playerModel = params.models.Player;
    }   
    
    async getAll() {
        return await this.playerModel.findAll();
    }

    async getOne(id) {
        return await this.playerModel.findByPk(id);
    }

    async create(data) {
        return await this.playerModel.create(data);
    }

    async update(id, data) {
        const player = await this.playerModel.findByPk(id);
        if (player) {
            await player.update(data);
            return player;
        } else {
            throw new NotFoundError('Player not found');
        }
    }

    async delete(id) {
        return await this.playerModel.destroy({ where: { id } });
    }
}

module.exports = PlayerRepository;