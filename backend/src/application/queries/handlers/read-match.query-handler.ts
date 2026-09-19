import type TournamentOwnershipService from '../../../shared/services/tournament-ownership.service';
import type { MatchDTO } from '../../dtos/match.dto';
import type { ReadMatchQuery } from '../read-match.query';

class ReadMatchQueryHandler {
    private tournamentOwnershipService: TournamentOwnershipService;

    constructor(params: { tournamentReadOwnershipService: TournamentOwnershipService }) {
        this.tournamentOwnershipService = params.tournamentReadOwnershipService;
    }

    async execute(query: ReadMatchQuery): Promise<MatchDTO> {
        const match = await this.tournamentOwnershipService.getMatchOwner(query.id, query.userId);
        return match.toJSON<MatchDTO>();
    }

}

export = ReadMatchQueryHandler;
