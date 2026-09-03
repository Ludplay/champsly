import { CreationAttributes } from 'sequelize';
import type { GroupRepository } from '../../shared/repositories/group.types';
import type TournamentOwnershipService from '../../shared/services/tournament-ownership.service';
import { Group } from '../../infra/db/models/group';

class UpdateGroupInteractor {
    private groupRepository: GroupRepository;
    private tournamentOwnershipService: TournamentOwnershipService;

    constructor(params: {
        groupRepository: GroupRepository;
        tournamentOwnershipService: TournamentOwnershipService;
    }) {
        this.groupRepository = params.groupRepository;
        this.tournamentOwnershipService = params.tournamentOwnershipService;
    }

    async execute(id: number, input: Partial<CreationAttributes<Group>>, userId: number) {
        await this.tournamentOwnershipService.getGroupOwner(id, userId);

        return await this.groupRepository.update(id, input);
    }

}

export = UpdateGroupInteractor;
