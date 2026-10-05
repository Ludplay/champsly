import type { GroupReadRepository } from '../../../shared/repositories/group.types';
import type { GroupStandingsReadRepository } from '../../../shared/repositories/group-standings.types';
import type TournamentOwnershipService from '../../../shared/services/tournament-ownership.service';
import { mergeGroupStandings } from '../../../shared/services/group-standings.service';
import type { GroupStandingsDTO } from '../../dtos/group-standings.dto';
import type { GetTournamentGroupsQuery } from '../get-tournament-groups.query';

// Standings come from the projection the stream processor maintains, so they can trail
// a just-recorded result by a moment (eventual consistency).
class GetTournamentGroupsQueryHandler {
    private groupRepository: GroupReadRepository;
    private groupStandingsRepository: GroupStandingsReadRepository;
    private tournamentOwnershipService: TournamentOwnershipService;

    constructor(params: {
        groupReadRepository: GroupReadRepository;
        groupStandingsReadRepository: GroupStandingsReadRepository;
        tournamentReadOwnershipService: TournamentOwnershipService;
    }) {
        this.groupRepository = params.groupReadRepository;
        this.groupStandingsRepository = params.groupStandingsReadRepository;
        this.tournamentOwnershipService = params.tournamentReadOwnershipService;
    }

    async execute(query: GetTournamentGroupsQuery): Promise<GroupStandingsDTO[]> {
        await this.tournamentOwnershipService.getTournamentOwner(query.tournamentId, query.userId);

        const groups = await this.groupRepository.getTournamentGroups(query.tournamentId);
        const groupIds = groups.map((group) => group.id);

        if (!groupIds.length) {
            return [];
        }

        const standings = await this.groupStandingsRepository.getByGroupIds(groupIds);

        return mergeGroupStandings(groups, standings);
    }

}

export = GetTournamentGroupsQueryHandler;
