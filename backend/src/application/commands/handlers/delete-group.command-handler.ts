import type { GroupRepository } from '../../../shared/repositories/group.types';
import type TournamentOwnershipService from '../../../shared/services/tournament-ownership.service';
import type { DeleteGroupCommand } from '../delete-group.command';

class DeleteGroupCommandHandler {
    private groupRepository: GroupRepository;
    private tournamentOwnershipService: TournamentOwnershipService;

    constructor(params: {
        groupRepository: GroupRepository;
        tournamentOwnershipService: TournamentOwnershipService;
    }) {
        this.groupRepository = params.groupRepository;
        this.tournamentOwnershipService = params.tournamentOwnershipService;
    }

    async execute(command: DeleteGroupCommand) {
        await this.tournamentOwnershipService.getGroupOwner(command.id, command.userId);

        return await this.groupRepository.delete(command.id);
    }

}

export = DeleteGroupCommandHandler;
