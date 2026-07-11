import axios from 'axios';

import type { Phase, PhaseInput } from '../types/phases';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function getPhases(): Promise<Phase[]> {
  const response = await api.get<Phase[]>('/get-phases');
  return response.data;
}

export async function createPhase(input: PhaseInput): Promise<Phase> {
  const response = await api.post<Phase>('/phase', input);
  return response.data;
}

export async function readPhase(id: number | string): Promise<Phase> {
  const response = await api.get<Phase>(`/phase/${id}`);
  return response.data;
}

export async function updatePhase(id: number | string, input: PhaseInput): Promise<Phase> {
  const response = await api.put<Phase>(`/phase/${id}`, input);
  return response.data;
}

export async function deletePhase(id: number | string): Promise<void> {
  await api.delete(`/phase/${id}`);
}

export async function generateGroupMatches(tournamentId: number): Promise<void> {
  console.log('tournamentId', tournamentId);
  await api.post('/tournament/generate-groups-matches', { id: tournamentId });
}
