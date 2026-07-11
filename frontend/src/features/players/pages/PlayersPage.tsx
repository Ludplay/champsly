import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { CreatePlayerPage } from './CreatePlayerPage'
import { EditPlayerPage } from './EditPlayerPage'
import { PlayersTable } from '../components/PlayersTable'
import { usePlayers } from '../hooks/use-players'
import type { PlayerInput } from '../types/players'
import type { Player } from '../types/players'

export default function PlayersPage() {
  const {
    players,
    loading,
    error,
    createPlayer,
    updatePlayer,
    deletePlayer,
  } = usePlayers()
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list')
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const editTarget = useMemo(() => selectedPlayer, [selectedPlayer])

  const openCreate = () => {
    setFormError(null)
    setSelectedPlayer(null)
    setMode('create')
  }

  const openEdit = (player: Player) => {
    setFormError(null)
    setSelectedPlayer(player)
    setMode('edit')
  }

  const closeForm = () => {
    setFormError(null)
    setSelectedPlayer(null)
    setMode('list')
  }

  const handleCreate = async (input: PlayerInput) => {
    setFormError(null)

    if (!input.name.trim()) {
      setFormError('Player name is required.')
      return
    }

    try {
      await createPlayer(input)
      closeForm()
    } catch (err) {
      setFormError('Could not save the new player.')
    }
  }

  const handleUpdate = async (input: PlayerInput) => {
    if (!selectedPlayer) {
      setFormError('No player selected for editing.')
      return
    }

    if (!input.name.trim()) {
      setFormError('Player name is required.')
      return
    }

    try {
      await updatePlayer(selectedPlayer.id, input)
      closeForm()
    } catch (err) {
      setFormError('Could not update the player.')
    }
  }

  const handleDelete = async (player: Player) => {
    await deletePlayer(player.id)
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Players</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            Manage player names
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Create, edit, and remove players using the backend players API.
          </p>
        </div>
        <Button onClick={openCreate}>Create player</Button>
      </div>

      {mode === 'create' ? (
        <CreatePlayerPage
          onCreate={handleCreate}
          onCancel={closeForm}
          loading={loading}
          error={formError ?? error}
        />
      ) : null}

      {mode === 'edit' && editTarget ? (
        <EditPlayerPage
          player={editTarget}
          onUpdate={handleUpdate}
          onCancel={closeForm}
          loading={loading}
          error={formError ?? error}
        />
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Player list</h2>
            <p className="text-sm text-slate-500">See all players and open the editor to update names.</p>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <PlayersTable players={players} loading={loading} onEdit={openEdit} onDelete={handleDelete} />
      </section>
    </main>
  )
}
