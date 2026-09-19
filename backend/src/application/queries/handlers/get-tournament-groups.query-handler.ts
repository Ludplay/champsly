import type { GroupReadRepository } from '../../../shared/repositories/group.types';
import type { MatchRepository } from '../../../shared/repositories/match.types';
import type TournamentOwnershipService from '../../../shared/services/tournament-ownership.service';
import { computeGroupStandings } from '../../../shared/services/group-standings.service';
import type { GroupStandingsDTO } from '../../dtos/group-standings.dto';
import type { GetTournamentGroupsQuery } from '../get-tournament-groups.query';

class GetTournamentGroupsQueryHandler {
    private groupRepository: GroupReadRepository;
    private matchRepository: MatchRepository;
    private tournamentOwnershipService: TournamentOwnershipService;

    constructor(params: {
        groupReadRepository: GroupReadRepository;
        matchReadRepository: MatchRepository;
        tournamentReadOwnershipService: TournamentOwnershipService;
    }) {
        this.groupRepository = params.groupReadRepository;
        this.matchRepository = params.matchReadRepository;
        this.tournamentOwnershipService = params.tournamentReadOwnershipService;
    }

    async execute(query: GetTournamentGroupsQuery): Promise<GroupStandingsDTO[]> {
        await this.tournamentOwnershipService.getTournamentOwner(query.tournamentId, query.userId);

        const groups = await this.groupRepository.getTournamentGroups(query.tournamentId);
        const groupIds = groups.map((group) => group.id);

        if (!groupIds.length) {
            return [];
        }

        const matches = await this.matchRepository.getMatchesByGroupIds(groupIds);

        return computeGroupStandings(groups, matches);
    }

}

export = GetTournamentGroupsQueryHandler;
