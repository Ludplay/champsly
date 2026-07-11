const Module = require("node:module");
const { NotFoundError } = require('../../shared/errors');

class TournamentRepository {

    constructor(params) {
        this.tournamentModel = params.models.Tournament;
    }   
    
    async getAll() {

        const options = {
            include: [{ 
                model: this.tournamentModel.sequelize.models.Player, as: 'Players' 
            }]
        }

        return await this.tournamentModel.findAll(options);
    }

    async getOne(id) {

        const options = {
            include: [{ model: this.tournamentModel.sequelize.models.Player, as: 'Players' }]
        };

        return await this.tournamentModel.findByPk(id, options);
    }

    async create(data) {
        return await this.tournamentModel.create(data);
    }

    async update(id, data) {
        const tournament = await this.tournamentModel.findByPk(id);
        if (tournament) {
            await tournament.update(data);
            return tournament;
        } else {
            throw new NotFoundError('Tournament not found');
        }
    }

    async delete(id) {
        return await this.tournamentModel.destroy({ where: { id } });
    }
}

module.exports = TournamentRepository;
