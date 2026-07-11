import { GroupForm } from '../components/GroupForm';
import type { Group, GroupInput } from '../types/groups';
import { usePlayers } from '@/features/players/hooks/use-players';
import { useTournaments } from '@/features/tournaments/hooks/use-tournaments';

type EditGroupPageProps = {
  group: Group;
  onUpdate: (group: GroupInput) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
};

export function EditGroupPage({ group, onUpdate, onCancel, loading, error }: EditGroupPageProps) {
  const { players, loading: playersLoading } = usePlayers();
  const { tournaments, loading: tournamentsLoading } = useTournaments();

  const defaultPlayerIds = group.Players?.map((player) => player.id) ?? [];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Edit group</h2>
        <p className="text-sm text-slate-500">Update the group details and assigned players.</p>
      </div>

      <GroupForm
        defaultTournamentId={group.tournament_id}
        defaultName={group.name ?? ''}
        defaultNumber={group.number}
        availableTournaments={tournaments}
        availablePlayers={players}
        defaultPlayerIds={defaultPlayerIds}
        playersLoading={playersLoading || tournamentsLoading}
        submitLabel={loading ? 'Updating…' : 'Update group'}
        error={error}
        disabled={loading}
        onCancel={onCancel}
        onSubmit={onUpdate}
      />
    </section>
  );
}
