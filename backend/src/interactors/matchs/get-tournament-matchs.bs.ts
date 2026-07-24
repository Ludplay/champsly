import type { MatchRepository } from '../../shared/repositories/match.types';

interface RoundMatch {
    id: number;
    player1_id: number;
    player1_name: string;
    player2_id: number;
    player2_name: string;
    phase_id: number;
    group_id: number | null;
    status: string;
    player1_score: number;
    player2_score: number;
    winner_player_id: number | null;
}

interface PhaseMatches {
    id: number;
    name: string;
    round_numbers: Record<number, RoundMatch[]>;
}

class GetTournamentMatchsInteractor {
    private matchRepository: MatchRepository;

    constructor(params: { matchRepository: MatchRepository }) {
        this.matchRepository = params.matchRepository;
    }

    async execute(tournamentId: number) {
        const matches = await this.matchRepository.getTournamentMatches(tournamentId);

        const phasesMap = new Map<number, PhaseMatches>();

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

export = GetTournamentMatchsInteractor;
