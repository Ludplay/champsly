import { CreationAttributes } from 'sequelize';
import { NotFoundError } from '../../shared/errors';
import { Phase } from '../../infra/db/models/phase';
import type { Db } from '../../infra/db/models/models.types';
import type { PhaseRepository } from '../../shared/repositories/phase.types';

class SequelizePhaseRepository implements PhaseRepository {
    private phaseModel: typeof Phase;

    constructor(params: { models: Db }) {
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

    async getOne(id: number) {
        return await this.phaseModel.findByPk(id);
    }

    async create(data: CreationAttributes<Phase>) {
        return await this.phaseModel.create(data);
    }

    async update(id: number, data: Partial<CreationAttributes<Phase>>) {
        const phase = await this.phaseModel.findByPk(id);
        if (phase) {
            await phase.update(data);
            return phase;
        } else {
            throw new NotFoundError('Phase not found');
        }
    }

    async delete(id: number) {
        return await this.phaseModel.destroy({ where: { id } });
    }

    async getTournamentPhases(tournamentId: number) {

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

    async getTournamentGroupsPhase(tournamentId: number) {

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

export = SequelizePhaseRepository;
