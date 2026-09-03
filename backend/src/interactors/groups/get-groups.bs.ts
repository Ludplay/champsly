import type { GroupRepository } from '../../shared/repositories/group.types';
import type { MatchRepository } from '../../shared/repositories/match.types';
import type TournamentOwnershipService from '../../shared/services/tournament-ownership.service';
import { computeGroupStandings } from '../../shared/services/group-standings.service';

class GetGroupsInteractor {
    private groupRepository: GroupRepository;
    private matchRepository: MatchRepository;
    private tournamentOwnershipService: TournamentOwnershipService;

    constructor(params: {
        groupRepository: GroupRepository;
        matchRepository: MatchRepository;
        tournamentOwnershipService: TournamentOwnershipService;
    }) {
        this.groupRepository = params.groupRepository;
        this.matchRepository = params.matchRepository;
        this.tournamentOwnershipService = params.tournamentOwnershipService;
    }

    async execute(userId: number) {
        return await this.groupRepository.getAllByUser(userId);
    }

    async executeByTournament(tournamentId: number, userId: number) {
        await this.tournamentOwnershipService.getTournamentOwner(tournamentId, userId);

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
