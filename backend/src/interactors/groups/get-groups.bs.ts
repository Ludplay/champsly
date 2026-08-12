import type { GroupRepository } from '../../shared/repositories/group.types';
import type { MatchRepository } from '../../shared/repositories/match.types';
import { computeGroupStandings } from '../../shared/services/group-standings.service';

class GetGroupsInteractor {
    private groupRepository: GroupRepository;
    private matchRepository: MatchRepository;

    constructor(params: { groupRepository: GroupRepository; matchRepository: MatchRepository }) {
        this.groupRepository = params.groupRepository;
        this.matchRepository = params.matchRepository;
    }

    async execute() {
        return await this.groupRepository.getAll();
    }

    async executeByTournament(tournamentId: number) {
        const groups = await this.groupRepository.getTournamentGroups(tournamentId);
        const groupIds = groups.map((group) => group.id);

        if (!groupIds.length) {
            return [];
        }

        const matches = await this.matchRepository.getMatchesByGroupIds(groupIds);

        return computeGroupStandings(groups, matches);
    }

}

export = GetGroupsInteractor;
