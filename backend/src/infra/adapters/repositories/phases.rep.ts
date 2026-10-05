import { CreationAttributes, Op } from 'sequelize';
import { NotFoundError } from '../../../shared/errors';
import { Phase } from '../../../infra/db/models/phase';
import type { Db } from '../../../infra/db/models/models.types';
import type { PhaseRepository } from '../../../shared/repositories/phase.types';
import { PhaseStatus } from '../../../shared/value-objects';
import type { TransactionOptions } from '../../../shared/persistence/transaction-manager.types';

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

    async getAllByUser(userId: number) {
        return await this.phaseModel.findAll({
            include: [
                {
                    association: 'Tournaments',
                    attributes: ['id', 'name'],
                    where: { user_id: userId }
                }
            ]
        });
    }

    async getOne(id: number) {
        return await this.phaseModel.findByPk(id);
    }

    async getOneWithTournament(id: number) {
        return await this.phaseModel.findByPk(id, {
            include: [
                {
                    association: 'Tournaments',
                    attributes: ['id', 'name']
                }
            ]
        });
    }

    async create(data: CreationAttributes<Phase>, options: TransactionOptions = {}) {
        return await this.phaseModel.create(data, options);
    }

    async update(id: number, data: Partial<CreationAttributes<Phase>>, options: TransactionOptions = {}) {
        const phase = await this.phaseModel.findByPk(id, options);
        if (phase) {
            await phase.update(data, options);
            return phase;
        } else {
            throw new NotFoundError('Phase not found');
        }
    }

    async delete(id: number, options: TransactionOptions = {}) {
        const destroyOptions = { where: { id }, transaction: options.transaction };

        return await this.phaseModel.destroy(destroyOptions);
    }

    async markFinished(id: number, options: TransactionOptions = {}) {
        const changes = { status: PhaseStatus.Finished };
        const updateOptions = {
            where: {
                id,
                status: { [Op.ne]: PhaseStatus.Finished }
            },
            transaction: options.transaction
        };

        const [affectedRows] = await this.phaseModel.update(changes, updateOptions);

        return affectedRows > 0;
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
