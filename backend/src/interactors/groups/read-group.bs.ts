import type { GroupRepository } from '../../shared/repositories/group.types';

class ReadGroupInteractor {
    private groupRepository: GroupRepository;

    constructor(params: { groupRepository: GroupRepository }) {
        this.groupRepository = params.groupRepository;
    }

    async execute(id: number) {
        return await this.groupRepository.getOne(id);
    }

}

export = ReadGroupInteractor;
