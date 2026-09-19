import type { GroupRepository } from '../../../shared/repositories/group.types';
import type TournamentOwnershipService from '../../../shared/services/tournament-ownership.service';
import type { CreateGroupCommand } from '../create-group.command';

class CreateGroupCommandHandler {
    private groupRepository: GroupRepository;
    private tournamentOwnershipService: TournamentOwnershipService;

    constructor(params: {
        groupRepository: GroupRepository;
        tournamentOwnershipService: TournamentOwnershipService;
    }) {
        this.groupRepository = params.groupRepository;
        this.tournamentOwnershipService = params.tournamentOwnershipService;
    }

    async execute(command: CreateGroupCommand) {
        const { tournament_id, name, number, userId } = command;

        await this.tournamentOwnershipService.getTournamentOwner(tournament_id, userId);

        const inputRecord = {
            tournament_id,
            name,
            number
        };

        return await this.groupRepository.create(inputRecord);
    }

}

export = CreateGroupCommandHandler;
