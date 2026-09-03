import api from '@/lib/api-client';

import type { Tournament, TournamentInput } from '../types/tournaments';

// Function to fetch all tournaments from the backend.
// This is used to load the list of tournaments on the main page.
export async function getTournaments(): Promise<Tournament[]> {
  const response = await api.get<Tournament[]>('/get-tournaments');
  return response.data;
}

// Function to create a new tournament.
// Takes the input data and sends it to the backend to create a new tournament.
export async function createTournament(input: TournamentInput): Promise<Tournament> {
  const response = await api.post<Tournament>('/tournament', input);
  return response.data;
}

// Function to read a single tournament by its ID.
// Useful for editing or viewing details of a specific tournament.
export async function readTournament(id: number | string): Promise<Tournament> {
  const response = await api.get<Tournament>(`/tournament/${id}`);
  return response.data;
}

// Function to update an existing tournament.
// Sends the updated data to the backend for the tournament with the given ID.
export async function updateTournament(
  id: number | string,
  input: TournamentInput,
): Promise<Tournament> {
  const response = await api.put<Tournament>(`/tournament/${id}`, input);
  return response.data;
}

// Function to delete a tournament by its ID.
// Removes the tournament from the backend.
export async function deleteTournament(id: number | string): Promise<void> {
  await api.delete(`/tournament/${id}`);
}