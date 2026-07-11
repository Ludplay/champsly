import { useCallback, useEffect, useState } from 'react';

import type { Tournament, TournamentInput } from '../types/tournaments';
import {
  createTournament as createTournamentRequest,
  deleteTournament as deleteTournamentRequest,
  getTournaments as getTournamentsRequest,
  updateTournament as updateTournamentRequest,
} from '../services/tournaments-api';

// Custom hook to manage tournament data and operations.
// This hook handles fetching, creating, updating, and deleting tournaments.
export function useTournaments() {
  // State to store the list of tournaments.
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  // State to track if we are currently loading data.
  const [loading, setLoading] = useState(false);

  // State to store any error messages.
  const [error, setError] = useState<string | null>(null);

  // Function to fetch all tournaments from the API.
  // This is called when the component mounts and can be called manually to refresh.
  const fetchTournaments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getTournamentsRequest();
      setTournaments(data);
    } catch (err) {
      setError('Unable to load tournaments. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect to load tournaments when the hook is first used.
  useEffect(() => {
    void fetchTournaments();
  }, [fetchTournaments]);

  // Function to create a new tournament.
  // Adds the new tournament to the local state after successful creation.
  const createTournament = useCallback(async (input: TournamentInput) => {
    setLoading(true);
    setError(null);

    try {
      const tournament = await createTournamentRequest(input);
      setTournaments((current) => [...current, tournament]);
      return tournament;
    } catch (err) {
      setError('Unable to create the tournament. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to update an existing tournament.
  // Updates the tournament in the local state after successful update.
  const updateTournament = useCallback(async (id: number, input: TournamentInput) => {
    setLoading(true);
    setError(null);

    try {
      const tournament = await updateTournamentRequest(id, input);
      setTournaments((current) =>
        current.map((item) => (item.id === tournament.id ? tournament : item)),
      );
      return tournament;
    } catch (err) {
      setError('Unable to update the tournament. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to delete a tournament.
  // Removes the tournament from the local state after successful deletion.
  const deleteTournament = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      await deleteTournamentRequest(id);
      setTournaments((current) => current.filter((tournament) => tournament.id !== id));
    } catch (err) {
      setError('Unable to delete the tournament. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Return all the state and functions so components can use them.
  return {
    tournaments,
    loading,
    error,
    fetchTournaments,
    createTournament,
    updateTournament,
    deleteTournament,
  };
}