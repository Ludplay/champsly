import { GroupForm } from '../components/GroupForm';
import { usePlayers } from '@/features/players/hooks/use-players';
import { useTournaments } from '@/features/tournaments/hooks/use-tournaments';
import type { GroupInput } from '../types/groups';

type CreateGroupPageProps = {
  onCreate: (group: GroupInput) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
};

export function CreateGroupPage({ onCreate, onCancel, loading, error }: CreateGroupPageProps) {
  const { players, loading: playersLoading } = usePlayers();
  const { tournaments, loading: tournamentsLoading } = useTournaments();

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Create group</h2>
        <p className="text-sm text-slate-500">Add a new group and assign players to it.</p>
      </div>

      <GroupForm
        defaultTournamentId={tournaments[0]?.id}
        defaultName=""
        defaultNumber={1}
        availableTournaments={tournaments}
        availablePlayers={players}
        defaultPlayerIds={[]}
        playersLoading={playersLoading || tournamentsLoading}
        submitLabel={loading ? 'Saving…' : 'Save group'}
        error={error}
        disabled={loading}
        onCancel={onCancel}
        onSubmit={onCreate}
      />
    </section>
  );
}
