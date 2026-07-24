import type { GroupRepository } from '../../shared/repositories/group.types';

class GetGroupsInteractor {
    private groupRepository: GroupRepository;

    constructor(params: { groupRepository: GroupRepository }) {
        this.groupRepository = params.groupRepository;
    }

    async execute() {
        return await this.groupRepository.getAll();
    }

    async executeByTournament(tournamentId: number) {
        return await this.groupRepository.getTournamentGroups(tournamentId);
    }

}

export = GetGroupsInteractor;
