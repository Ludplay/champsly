import { PlayerForm } from '../components/PlayerForm'
import type { PlayerInput } from '../types/players'

type CreatePlayerPageProps = {
  onCreate: (player: PlayerInput) => void | Promise<void>
  onCancel: () => void
  loading?: boolean
  error?: string | null
}

export function CreatePlayerPage({
  onCreate,
  onCancel,
  loading,
  error,
}: CreatePlayerPageProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Create player</h2>
        <p className="text-sm text-slate-500">Add a new player with a single name field.</p>
      </div>
      <PlayerForm
        defaultName=""
        submitLabel={loading ? 'Saving…' : 'Save player'}
        error={error}
        disabled={loading}
        onCancel={onCancel}
        onSubmit={onCreate}
      />
    </section>
  )
}
