const Module = require("node:module");
const { NotFoundError } = require('../../shared/errors');

class MatchRepository {

    constructor(params) {
        this.matchModel = params.models.Match;
    }   
    
    async getAll() {
        return await this.matchModel.findAll();
    }
    
    async getTournamentMatches(tournamentId) {
        const options = {
            include: [
                {
                    model: this.matchModel.sequelize.models.Phase,
                    as: 'Phase',
                    where: {
                        tournament_id: tournamentId
                    }
                },
                {
                    model: this.matchModel.sequelize.models.Player,
                    as: 'Player1',
                    attributes: ['id', 'name']
                },
                {
                    model: this.matchModel.sequelize.models.Player,
                    as: 'Player2',
                    attributes: ['id', 'name']
                }
            ]
        };

        return await this.matchModel.findAll(options);
    }

    async getOne(id) {
        return await this.matchModel.findByPk(id);
    }

    async create(data) {
        return await this.matchModel.create(data);
    }

    async update(id, data) {
        const match = await this.matchModel.findByPk(id);
        if (match) {
            await match.update(data);
            return match;
        } else {
            throw new NotFoundError('Match not found');
        }
    }

    async delete(id) {
        return await this.matchModel.destroy({ where: { id } });
    }

    async phaseMatchesExist(phaseId) { 

        const options = {        
            where: {
                phase_id: phaseId
            }
        };

        return await this.matchModel.findOne(options);
    }

    async createMany(data) {
        return await this.matchModel.bulkCreate(data);
    }
}

module.exports = MatchRepository;
