export interface MatchRoundDTO {
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

export interface PhaseMatchesDTO {
    id: number;
    name: string;
    round_numbers: Record<number, MatchRoundDTO[]>;
}

export interface TournamentMatchesDTO {
    phases: PhaseMatchesDTO[];
}
