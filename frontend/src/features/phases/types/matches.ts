export interface MatchRound {
  id: number;
  player1_id?: number;
  player1_name?: string | null;
  player2_id?: number;
  player2_name?: string | null;
  status?: string;
  player1_score?: number;
  player2_score?: number;
}

export interface PhaseMatches {
  id: number;
  name?: string | null;
  round_numbers: Record<string, MatchRound[]>;
}

export interface MatchResponse {
  phases: PhaseMatches[];
}
