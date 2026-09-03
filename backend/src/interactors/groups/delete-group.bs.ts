import type { GroupRepository } from '../../shared/repositories/group.types';
import type TournamentOwnershipService from '../../shared/services/tournament-ownership.service';

class DeleteGroupInteractor {
    private groupRepository: GroupRepository;
    private tournamentOwnershipService: TournamentOwnershipService;

    constructor(params: {
        groupRepository: GroupRepository;
        tournamentOwnershipService: TournamentOwnershipService;
    }) {
        this.groupRepository = params.groupRepository;
        this.tournamentOwnershipService = params.tournamentOwnershipService;
    }

    async execute(id: number, userId: number) {
        await this.tournamentOwnershipService.getGroupOwner(id, userId);

        return await this.groupRepository.delete(id);
    }

}

export = DeleteGroupInteractor;
