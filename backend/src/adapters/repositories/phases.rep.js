const Module = require("node:module");
const { NotFoundError } = require('../../shared/errors');

class PhaseRepository {

    constructor(params) {
        this.phaseModel = params.models.Phase;
    }   
    
    async getAll() {
        return await this.phaseModel.findAll({
            include: [
                {
                    association: 'Tournaments',
                    attributes: ['id', 'name']
                }
            ]
        });
    }

    async getOne(id) {
        return await this.phaseModel.findByPk(id);
    }

    async create(data) {
        return await this.phaseModel.create(data);
    }

    async update(id, data) {
        const phase = await this.phaseModel.findByPk(id);
        if (phase) {
            await phase.update(data);
            return phase;
        } else {
            throw new NotFoundError('Phase not found');
        }
    }

    async delete(id) {
        return await this.phaseModel.destroy({ where: { id } });
    }

    async getTournamentPhases(tournamentId) {

        const options = {        
            where: {
                tournament_id: tournamentId
            },
            include: [
                {
                    association: 'Tournaments',
                    attributes: ['id', 'name']
                }
            ]
        };

        return await this.phaseModel.findAll(options);
    }

    async getTournamentGroupsPhase(tournamentId) {

        const options = {        
            where: {
                tournament_id: tournamentId
            },
            include: [
                {
                    association: 'Tournaments',
                    attributes: ['id', 'name']
                }
            ]
        };

        // Currently considering groups phase as the first phase
        return await this.phaseModel.findOne(options);
    }
}

module.exports = PhaseRepository;
