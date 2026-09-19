import type { MatchRepository } from '../../../shared/repositories/match.types';
import type TournamentOwnershipService from '../../../shared/services/tournament-ownership.service';
import type { TournamentMatchesDTO, PhaseMatchesDTO } from '../../dtos/tournament-matches.dto';
import type { GetTournamentMatchesQuery } from '../get-tournament-matches.query';

class GetTournamentMatchesQueryHandler {
    private matchRepository: MatchRepository;
    private tournamentOwnershipService: TournamentOwnershipService;

    constructor(params: {
        matchReadRepository: MatchRepository;
        tournamentReadOwnershipService: TournamentOwnershipService;
    }) {
        this.matchRepository = params.matchReadRepository;
        this.tournamentOwnershipService = params.tournamentReadOwnershipService;
    }

    async execute(query: GetTournamentMatchesQuery): Promise<TournamentMatchesDTO> {
        await this.tournamentOwnershipService.getTournamentOwner(query.tournamentId, query.userId);

        const matches = await this.matchRepository.getTournamentMatches(query.tournamentId);

        const phasesMap = new Map<number, PhaseMatchesDTO>();

        for (const match of matches) {
            const phaseId = match.Phase!.id;
            const phaseName = match.Phase!.name;
            const roundNumber = match.round_number;

            if (!phasesMap.has(phaseId)) {
                phasesMap.set(phaseId, {
                    id: phaseId,
                    name: phaseName,
                    round_numbers: {}
                });
            }

            const phase = phasesMap.get(phaseId)!;
            if (!phase.round_numbers[roundNumber]) {
                phase.round_numbers[roundNumber] = [];
            }

            phase.round_numbers[roundNumber].push({
                id: match.id,
                player1_id: match.player1_id,
                player1_name: match.Player1!.name,
                player2_id: match.player2_id,
                player2_name: match.Player2!.name,
                phase_id: match.phase_id,
                group_id: match.group_id,
                status: match.status,
                player1_score: match.player1_score,
                player2_score: match.player2_score,
                winner_player_id: match.winner_player_id
            });
        }

        const phases = Array.from(phasesMap.values());
        return { phases };
    }

}

export = GetTournamentMatchesQueryHandler;
