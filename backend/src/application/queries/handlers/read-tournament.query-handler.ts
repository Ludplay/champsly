import type TournamentOwnershipService from '../../../shared/services/tournament-ownership.service';
import type { TournamentDTO } from '../../dtos/tournament.dto';
import type { ReadTournamentQuery } from '../read-tournament.query';

class ReadTournamentQueryHandler {
    private tournamentOwnershipService: TournamentOwnershipService;

    constructor(params: { tournamentReadOwnershipService: TournamentOwnershipService }) {
        this.tournamentOwnershipService = params.tournamentReadOwnershipService;
    }

    async execute(query: ReadTournamentQuery): Promise<TournamentDTO> {
        const tournament = await this.tournamentOwnershipService.getTournamentOwner(query.id, query.userId);
        return tournament.toJSON<TournamentDTO>();
    }

}

export = ReadTournamentQueryHandler;
