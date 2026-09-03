import api from '@/lib/api-client'

import type { Player, PlayerInput } from '../types/players'

export async function getPlayers(): Promise<Player[]> {
  const response = await api.get<Player[]>('/get-players')
  return response.data
}

export async function createPlayer(input: PlayerInput): Promise<Player> {
  const response = await api.post<Player>('/player', input)
  return response.data
}

export async function readPlayer(id: number | string): Promise<Player> {
  const response = await api.get<Player>(`/player/${id}`)
  return response.data
}

export async function updatePlayer(
  id: number | string,
  input: PlayerInput,
): Promise<Player> {
  const response = await api.put<Player>(`/player/${id}`, input)
  return response.data
}

export async function deletePlayer(id: number | string): Promise<void> {
  await api.delete(`/player/${id}`)
}
