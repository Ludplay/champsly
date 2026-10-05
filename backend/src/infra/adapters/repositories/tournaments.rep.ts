import { CreationAttributes } from 'sequelize';
import { NotFoundError } from '../../../shared/errors';
import { Tournament } from '../../../infra/db/models/tournament';
import { Player } from '../../../infra/db/models/player';
import type { Db } from '../../../infra/db/models/models.types';
import type { TournamentRepository } from '../../../shared/repositories/tournament.types';
import type { TransactionOptions } from '../../../shared/persistence/transaction-manager.types';

class SequelizeTournamentRepository implements TournamentRepository {
    private tournamentModel: typeof Tournament;
    private playerModel: typeof Player;

    constructor(params: { models: Db }) {
        this.tournamentModel = params.models.Tournament;
        this.playerModel = params.models.Player;
    }

    async getAll() {
        const options = {
            include: [{
                model: this.playerModel, as: 'Players'
            }]
        };

        return await this.tournamentModel.findAll(options);
    }

    async getAllByUser(userId: number) {
        const options = {
            where: { user_id: userId },
            include: [{
                model: this.playerModel, as: 'Players'
            }]
        };

        return await this.tournamentModel.findAll(options);
    }

    async getOne(id: number) {
        const options = {
            include: [{ model: this.playerModel, as: 'Players' }]
        };

        return await this.tournamentModel.findByPk(id, options);
    }

    async create(data: CreationAttributes<Tournament>, options: TransactionOptions = {}) {
        return await this.tournamentModel.create(data, options);
    }

    async update(id: number, data: Partial<CreationAttributes<Tournament>>, options: TransactionOptions = {}) {
        const tournament = await this.tournamentModel.findByPk(id, options);
        if (tournament) {
            await tournament.update(data, options);
            return tournament;
        } else {
            throw new NotFoundError('Tournament not found');
        }
    }

    async delete(id: number, options: TransactionOptions = {}) {
        const destroyOptions = { where: { id }, transaction: options.transaction };

        return await this.tournamentModel.destroy(destroyOptions);
    }
}

export = SequelizeTournamentRepository;
