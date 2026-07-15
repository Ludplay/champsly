import axios from 'axios';

import type { Group, GroupInput } from '../types/groups';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function getGroups(): Promise<Group[]> {
  const response = await api.get<Group[]>('/get-groups');
  return response.data;
}

export async function getGroupsByTournament(tournamentId: number): Promise<Group[]> {
  const response = await api.get<Group[]>(`/tournament/${tournamentId}/groups`);
  return response.data;
}

export async function createGroup(input: GroupInput): Promise<Group> {
  const response = await api.post<Group>('/group', input);
  return response.data;
}

export async function readGroup(id: number | string): Promise<Group> {
  const response = await api.get<Group>(`/group/${id}`);
  return response.data;
}

export async function updateGroup(id: number | string, input: GroupInput): Promise<Group> {
  const response = await api.put<Group>(`/group/${id}`, input);
  return response.data;
}

export async function deleteGroup(id: number | string): Promise<void> {
  await api.delete(`/group/${id}`);
}
