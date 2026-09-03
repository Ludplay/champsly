import api from '@/lib/api-client';

import type { MatchResponse, PhaseMatches } from '../types/matches';

interface MatchApiResponseWrapper {
  data: MatchResponse;
}

function normalizeMatchResponse(response: MatchResponse | MatchApiResponseWrapper): MatchResponse {
  if ('phases' in response) {
    if (!Array.isArray(response.phases) && response.phases && typeof response.phases === 'object') {
      return {
        phases: Object.values(response.phases) as PhaseMatches[],
      };
    }

    return response;
  }

  return response.data;
}

export async function getMatchesByTournament(tournamentId: number): Promise<MatchResponse> {
  const response = await api.get<MatchResponse | MatchApiResponseWrapper>(`/tournament/${tournamentId}/matchs`);
  return normalizeMatchResponse(response.data);
}

export async function updateMatch(matchId: number, payload: { player1_score?: number; player2_score?: number; winner_player_id?: number; }): Promise<any> {
  const response = await api.put(`/match/${matchId}`, payload);
  return response.data;
}
