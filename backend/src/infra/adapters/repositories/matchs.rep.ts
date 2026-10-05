import { CreationAttributes, Op } from 'sequelize';
import { NotFoundError } from '../../../shared/errors';
import { Match } from '../../../infra/db/models/match';
import { Phase } from '../../../infra/db/models/phase';
import { Player } from '../../../infra/db/models/player';
import type { Db } from '../../../infra/db/models/models.types';
import type { MatchRepository } from '../../../shared/repositories/match.types';
import { MatchStatus } from '../../../shared/value-objects';
import type { TransactionOptions } from '../../../shared/persistence/transaction-manager.types';

class SequelizeMatchRepository implements MatchRepository {
    private matchModel: typeof Match;
    private phaseModel: typeof Phase;
    private playerModel: typeof Player;

    constructor(params: { models: Db }) {
        this.matchModel = params.models.Match;
        this.phaseModel = params.models.Phase;
        this.playerModel = params.models.Player;
    }

    async getAll() {
        return await this.matchModel.findAll();
    }

    async getAllByUser(userId: number) {
        return await this.matchModel.findAll({
            include: [
                {
                    model: this.phaseModel,
                    as: 'Phase',
                    attributes: [],
                    include: [
                        { association: 'Tournaments', attributes: [], where: { user_id: userId } }
                    ]
                }
            ]
        });
    }

    async getTournamentMatches(tournamentId: number) {
        const options = {
            include: [
                {
                    model: this.phaseModel,
                    as: 'Phase',
                    where: {
                        tournament_id: tournamentId
                    }
                },
                {
                    model: this.playerModel,
                    as: 'Player1',
                    attributes: ['id', 'name']
                },
                {
                    model: this.playerModel,
                    as: 'Player2',
                    attributes: ['id', 'name']
                }
            ]
        };

        return await this.matchModel.findAll(options);
    }

    async getOne(id: number) {
        return await this.matchModel.findByPk(id);
    }

    async create(data: CreationAttributes<Match>, options: TransactionOptions = {}) {
        return await this.matchModel.create(data, options);
    }

    async update(id: number, data: Partial<CreationAttributes<Match>>, options: TransactionOptions = {}) {
        const match = await this.matchModel.findByPk(id, options);
        if (match) {
            await match.update(data, options);
            return match;
        } else {
            throw new NotFoundError('Match not found');
        }
    }

    async delete(id: number, options: TransactionOptions = {}) {
        const destroyOptions = { where: { id }, transaction: options.transaction };

        return await this.matchModel.destroy(destroyOptions);
    }

    async phaseMatchesExist(phaseId: number) {

        const options = {
            where: {
                phase_id: phaseId
            }
        };

        return await this.matchModel.findOne(options);
    }

    async hasUnfinishedMatches(phaseId: number) {

        const options = {
            where: {
                phase_id: phaseId,
                status: { [Op.ne]: MatchStatus.Finished }
            }
        };

        const unfinishedCount = await this.matchModel.count(options);

        return unfinishedCount > 0;
    }

    async createMany(data: CreationAttributes<Match>[], options: TransactionOptions = {}) {
        return await this.matchModel.bulkCreate(data, options);
    }
}

export = SequelizeMatchRepository;
