import type { GroupRepository } from '../../shared/repositories/group.types';

class DeleteGroupInteractor {
    private groupRepository: GroupRepository;

    constructor(params: { groupRepository: GroupRepository }) {
        this.groupRepository = params.groupRepository;
    }

    async execute(id: number) {
        return await this.groupRepository.delete(id);
    }

}

export = DeleteGroupInteractor;
