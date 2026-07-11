import { useCallback, useEffect, useState } from 'react';

import type { PhaseMatches } from '../types/matches';
import { getMatchesByTournament } from '../services/matches-api';

export function useMatches(tournamentId?: number) {
  const [phases, setPhases] = useState<PhaseMatches[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    if (!tournamentId) return;
    setLoading(true);
    setError(null);

    try {
      const data = await getMatchesByTournament(tournamentId);
      setPhases(data?.phases ?? []);
    } catch (err) {
      setError('Unable to load matches.');
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    void fetchMatches();
  }, [fetchMatches]);

  return { phases, loading, error, fetchMatches };
}
