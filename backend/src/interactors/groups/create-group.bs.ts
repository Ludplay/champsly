import { CreationAttributes } from 'sequelize';
import type { GroupRepository } from '../../shared/repositories/group.types';
import { Group } from '../../infra/db/models/group';

class CreateGroupInteractor {
    private groupRepository: GroupRepository;

    constructor(params: { groupRepository: GroupRepository }) {
        this.groupRepository = params.groupRepository;
    }

    async execute(input: Pick<CreationAttributes<Group>, 'tournament_id' | 'name' | 'number'>) {
        const { tournament_id, name, number } = input;

        const inputRecord = {
            tournament_id,
            name,
            number
        };

        return await this.groupRepository.create(inputRecord);
    }

}

export = CreateGroupInteractor;
