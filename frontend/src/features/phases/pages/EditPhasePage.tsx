import { PhaseForm } from '../components/PhaseForm';
import type { Phase, PhaseInput } from '../types/phases';
import { useTournaments } from '@/features/tournaments/hooks/use-tournaments';

type EditPhasePageProps = {
  phase: Phase;
  onUpdate: (phase: PhaseInput) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
};

export function EditPhasePage({ phase, onUpdate, onCancel, loading, error }: EditPhasePageProps) {
  const { tournaments } = useTournaments();

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Edit phase</h2>
        <p className="text-sm text-slate-500">Update the phase settings and tournament assignment.</p>
      </div>

      <PhaseForm
        defaultTournamentId={phase.tournament_id}
        defaultName={phase.name}
        defaultStatus={phase.status}
        defaultNumber={phase.number ?? 1}
        availableTournaments={tournaments}
        submitLabel={loading ? 'Updating…' : 'Update phase'}
        error={error}
        disabled={loading}
        onCancel={onCancel}
        onSubmit={onUpdate}
      />
    </section>
  );
}
