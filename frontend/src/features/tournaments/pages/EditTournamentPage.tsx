import { TournamentForm } from '../components/TournamentForm';
import type { Tournament, TournamentInput } from '../types/tournaments';

// Props for the EditTournamentPage component.
// Defines the tournament to edit and callbacks for updating and canceling.
type EditTournamentPageProps = {
  tournament: Tournament;
  onUpdate: (tournament: TournamentInput) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
};

// Page component for editing an existing tournament.
// Pre-fills the form with current tournament data and handles updates.
export function EditTournamentPage({
  tournament,
  onUpdate,
  onCancel,
  loading,
  error,
}: EditTournamentPageProps) {
  const defaultPlayerIds = tournament.Players?.map((player) => player.id) ?? [];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Edit tournament</h2>
        <p className="text-sm text-slate-500">Update the tournament details and save your changes.</p>
      </div>

      {/* Tournament form with pre-filled values */}
      <TournamentForm
        defaultName={tournament.name}
        defaultGroupsQuantity={tournament.groups_quantity}
        defaultPhasesQuantity={tournament.phases_quantity}
        defaultStatus={tournament.status}
        availablePlayers={tournament.Players ?? []}
        defaultPlayerIds={defaultPlayerIds}
        submitLabel={loading ? 'Updating…' : 'Update tournament'}
        error={error}
        disabled={loading}
        onCancel={onCancel}
        onSubmit={onUpdate}
      />
    </section>
  );
}