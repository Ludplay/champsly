import { TournamentForm } from '../components/TournamentForm';
import { usePlayers } from '@/features/players/hooks/use-players';
import type { TournamentInput } from '../types/tournaments';

// Props for the CreateTournamentPage component.
// Defines the callback for creating a tournament and other UI states.
type CreateTournamentPageProps = {
  onCreate: (tournament: TournamentInput) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
};

// Page component for creating a new tournament.
// Displays a form to input tournament details and handles submission.
export function CreateTournamentPage({
  onCreate,
  onCancel,
  loading,
  error,
}: CreateTournamentPageProps) {
  const { players, loading: playersLoading } = usePlayers();

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Create tournament</h2>
        <p className="text-sm text-slate-500">Add a new tournament with name, groups, phases, and status.</p>
      </div>

      {/* Tournament form */}
      <TournamentForm
        defaultName=""
        defaultGroupsQuantity={1}
        defaultPhasesQuantity={1}
        defaultStatus="active"
        availablePlayers={players}
        playersLoading={playersLoading}
        submitLabel={loading ? 'Saving…' : 'Save tournament'}
        error={error}
        disabled={loading}
        onCancel={onCancel}
        onSubmit={onCreate}
      />
    </section>
  );
}