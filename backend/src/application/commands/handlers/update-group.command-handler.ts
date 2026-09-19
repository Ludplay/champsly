import type { GroupRepository } from '../../../shared/repositories/group.types';
import type TournamentOwnershipService from '../../../shared/services/tournament-ownership.service';
import type { UpdateGroupCommand } from '../update-group.command';

class UpdateGroupCommandHandler {
    private groupRepository: GroupRepository;
    private tournamentOwnershipService: TournamentOwnershipService;

    constructor(params: {
        groupRepository: GroupRepository;
        tournamentOwnershipService: TournamentOwnershipService;
    }) {
        this.groupRepository = params.groupRepository;
        this.tournamentOwnershipService = params.tournamentOwnershipService;
    }

    async execute(command: UpdateGroupCommand) {
        await this.tournamentOwnershipService.getGroupOwner(command.id, command.userId);

        return await this.groupRepository.update(command.id, command.changes);
    }

}

export = UpdateGroupCommandHandler;
