import { PlayerForm } from '../components/PlayerForm'
import type { Player, PlayerInput } from '../types/players'

type EditPlayerPageProps = {
  player: Player
  onUpdate: (player: PlayerInput) => void | Promise<void>
  onCancel: () => void
  loading?: boolean
  error?: string | null
}

export function EditPlayerPage({
  player,
  onUpdate,
  onCancel,
  loading,
  error,
}: EditPlayerPageProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Edit player</h2>
        <p className="text-sm text-slate-500">Update the player name and save your changes.</p>
      </div>
      <PlayerForm
        defaultName={player.name}
        submitLabel={loading ? 'Updating…' : 'Update player'}
        error={error}
        disabled={loading}
        onCancel={onCancel}
        onSubmit={onUpdate}
      />
    </section>
  )
}
