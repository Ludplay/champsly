import type TournamentOwnershipService from '../../../shared/services/tournament-ownership.service';
import type { GroupDTO } from '../../dtos/group.dto';
import type { ReadGroupQuery } from '../read-group.query';

class ReadGroupQueryHandler {
    private tournamentOwnershipService: TournamentOwnershipService;

    constructor(params: { tournamentReadOwnershipService: TournamentOwnershipService }) {
        this.tournamentOwnershipService = params.tournamentReadOwnershipService;
    }

    async execute(query: ReadGroupQuery): Promise<GroupDTO> {
        const group = await this.tournamentOwnershipService.getGroupOwner(query.id, query.userId);
        return group.toJSON<GroupDTO>();
    }

}

export = ReadGroupQueryHandler;
