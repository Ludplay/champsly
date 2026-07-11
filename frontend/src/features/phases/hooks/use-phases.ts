import { useCallback, useEffect, useState } from 'react';

import type { Phase, PhaseInput } from '../types/phases';
import {
  createPhase as createPhaseRequest,
  deletePhase as deletePhaseRequest,
  getPhases as getPhasesRequest,
  updatePhase as updatePhaseRequest,
} from '../services/phases-api';

export function usePhases() {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPhases = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getPhasesRequest();
      setPhases(data);
    } catch (err) {
      setError('Unable to load phases. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPhases();
  }, [fetchPhases]);

  const createPhase = useCallback(async (input: PhaseInput) => {
    setLoading(true);
    setError(null);

    try {
      const phase = await createPhaseRequest(input);
      setPhases((current) => [...current, phase]);
      return phase;
    } catch (err) {
      setError('Unable to create the phase. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePhase = useCallback(async (id: number, input: PhaseInput) => {
    setLoading(true);
    setError(null);

    try {
      const phase = await updatePhaseRequest(id, input);
      setPhases((current) => current.map((item) => (item.id === phase.id ? phase : item)));
      return phase;
    } catch (err) {
      setError('Unable to update the phase. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePhase = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      await deletePhaseRequest(id);
      setPhases((current) => current.filter((phase) => phase.id !== id));
    } catch (err) {
      setError('Unable to delete the phase. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    phases,
    loading,
    error,
    fetchPhases,
    createPhase,
    updatePhase,
    deletePhase,
  };
}
