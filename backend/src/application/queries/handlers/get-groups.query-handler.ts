import type { GroupReadRepository } from '../../../shared/repositories/group.types';
import type { GroupDTO } from '../../dtos/group.dto';
import type { GetGroupsQuery } from '../get-groups.query';

class GetGroupsQueryHandler {
    private groupRepository: GroupReadRepository;

    constructor(params: { groupReadRepository: GroupReadRepository }) {
        this.groupRepository = params.groupReadRepository;
    }

    async execute(query: GetGroupsQuery): Promise<GroupDTO[]> {
        const groups = await this.groupRepository.getAllByUser(query.userId);
        return groups.map((group) => group.toJSON<GroupDTO>());
    }

}

export = GetGroupsQueryHandler;
