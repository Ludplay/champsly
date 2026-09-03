import { CreationAttributes } from 'sequelize';
import type { GroupRepository } from '../../shared/repositories/group.types';
import type TournamentOwnershipService from '../../shared/services/tournament-ownership.service';
import { Group } from '../../infra/db/models/group';

class CreateGroupInteractor {
    private groupRepository: GroupRepository;
    private tournamentOwnershipService: TournamentOwnershipService;

    constructor(params: {
        groupRepository: GroupRepository;
        tournamentOwnershipService: TournamentOwnershipService;
    }) {
        this.groupRepository = params.groupRepository;
        this.tournamentOwnershipService = params.tournamentOwnershipService;
    }

    async execute(input: Pick<CreationAttributes<Group>, 'tournament_id' | 'name' | 'number'>, userId: number) {
        const { tournament_id, name, number } = input;

        await this.tournamentOwnershipService.getTournamentOwner(tournament_id, userId);

        const inputRecord = {
            tournament_id,
            name,
            number
        };

        return await this.groupRepository.create(inputRecord);
    }

}

export = CreateGroupInteractor;
