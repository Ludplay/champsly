import { useCallback, useEffect, useState } from 'react'

import type { Player, PlayerInput } from '../types/players'
import {
  createPlayer as createPlayerRequest,
  deletePlayer as deletePlayerRequest,
  getPlayers as getPlayersRequest,
  updatePlayer as updatePlayerRequest,
} from '../services/players-api'

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPlayers = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getPlayersRequest()
      setPlayers(data)
    } catch (err) {
      setError('Unable to load players. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchPlayers()
  }, [fetchPlayers])

  const createPlayer = useCallback(async (input: PlayerInput) => {
    setLoading(true)
    setError(null)

    try {
      const player = await createPlayerRequest(input)
      setPlayers((current) => [...current, player])
      return player
    } catch (err) {
      setError('Unable to create the player. Please try again.')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updatePlayer = useCallback(async (id: number, input: PlayerInput) => {
    setLoading(true)
    setError(null)

    try {
      const player = await updatePlayerRequest(id, input)
      setPlayers((current) =>
        current.map((item) => (item.id === player.id ? player : item)),
      )
      return player
    } catch (err) {
      setError('Unable to update the player. Please try again.')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deletePlayer = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)

    try {
      await deletePlayerRequest(id)
      setPlayers((current) => current.filter((player) => player.id !== id))
    } catch (err) {
      setError('Unable to delete the player. Please try again.')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    players,
    loading,
    error,
    fetchPlayers,
    createPlayer,
    updatePlayer,
    deletePlayer,
  }
}
