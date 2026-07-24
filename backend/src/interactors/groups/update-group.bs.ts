import { CreationAttributes } from 'sequelize';
import type { GroupRepository } from '../../shared/repositories/group.types';
import { Group } from '../../infra/db/models/group';

class UpdateGroupInteractor {
    private groupRepository: GroupRepository;

    constructor(params: { groupRepository: GroupRepository }) {
        this.groupRepository = params.groupRepository;
    }

    async execute(id: number, input: Partial<CreationAttributes<Group>>) {
        return await this.groupRepository.update(id, input);
    }

}

export = UpdateGroupInteractor;
