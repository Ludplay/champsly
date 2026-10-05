import { CreationAttributes } from 'sequelize';
import { GroupStanding } from '../../../infra/db/models/group-standing';
import type { Db } from '../../../infra/db/models/models.types';
import type { GroupStandingsRepository, GroupStandingsReadRepository } from '../../../shared/repositories/group-standings.types';
import type { RequiredTransactionOptions } from '../../../shared/persistence/transaction-manager.types';

class SequelizeGroupStandingsRepository implements GroupStandingsRepository, GroupStandingsReadRepository {
    private groupStandingModel: typeof GroupStanding;

    constructor(params: { models: Db }) {
        this.groupStandingModel = params.models.GroupStanding;
    }

    async replaceForGroup(groupId: number, standings: CreationAttributes<GroupStanding>[], options: RequiredTransactionOptions) {
        const destroyOptions = { where: { group_id: groupId }, transaction: options.transaction };

        await this.groupStandingModel.destroy(destroyOptions);
        await this.groupStandingModel.bulkCreate(standings, options);
    }

    async getByGroupIds(groupIds: number[]) {
        const options = {
            where: {
                group_id: groupIds
            },
            raw: true
        };

        return await this.groupStandingModel.findAll(options);
    }
}

export = SequelizeGroupStandingsRepository;
