import { PhaseForm } from '../components/PhaseForm';
import { useTournaments } from '@/features/tournaments/hooks/use-tournaments';
import type { PhaseInput } from '../types/phases';

type CreatePhasePageProps = {
  onCreate: (phase: PhaseInput) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
};

export function CreatePhasePage({ onCreate, onCancel, loading, error }: CreatePhasePageProps) {
  const { tournaments } = useTournaments();

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Create phase</h2>
        <p className="text-sm text-slate-500">Add a new phase and connect it to a tournament.</p>
      </div>

      <PhaseForm
        defaultTournamentId={tournaments[0]?.id}
        defaultName=""
        defaultStatus="active"
        defaultNumber={1}
        availableTournaments={tournaments}
        submitLabel={loading ? 'Saving…' : 'Save phase'}
        error={error}
        disabled={loading}
        onCancel={onCancel}
        onSubmit={onCreate}
      />
    </section>
  );
}
