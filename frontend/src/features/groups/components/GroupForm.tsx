import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { GroupInput } from '../types/groups';
import type { Player } from '@/features/players/types/players';
import type { Tournament } from '@/features/tournaments/types/tournaments';

type GroupFormProps = {
  defaultTournamentId?: number;
  defaultName?: string;
  defaultNumber?: number;
  availableTournaments?: Tournament[];
  availablePlayers?: Player[];
  defaultPlayerIds?: number[];
  playersLoading?: boolean;
  submitLabel: string;
  error?: string | null;
  disabled?: boolean;
  onCancel?: () => void;
  onSubmit: (group: GroupInput) => void | Promise<void>;
};

export function GroupForm({
  defaultTournamentId,
  defaultName = '',
  defaultNumber = 1,
  availableTournaments = [],
  availablePlayers = [],
  defaultPlayerIds = [],
  playersLoading = false,
  submitLabel,
  error,
  disabled = false,
  onCancel,
  onSubmit,
}: GroupFormProps) {
  const initialTournamentId = defaultTournamentId ?? availableTournaments[0]?.id ?? 0;
  const [tournamentId, setTournamentId] = useState(initialTournamentId);
  const [name, setName] = useState(defaultName);
  const [number, setNumber] = useState(defaultNumber);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>(defaultPlayerIds ?? []);

  const defaultPlayerIdsKey = defaultPlayerIds ? defaultPlayerIds.join(',') : '';

  useEffect(() => {
    const resolvedTournamentId = defaultTournamentId ?? availableTournaments[0]?.id ?? 0;
    setTournamentId(resolvedTournamentId);
    setName(defaultName);
    setNumber(defaultNumber);
    setSelectedPlayerIds(defaultPlayerIds ?? []);
  }, [defaultTournamentId, defaultName, defaultNumber, defaultPlayerIdsKey, availableTournaments]);

  const togglePlayer = (playerId: number) => {
    setSelectedPlayerIds((current) => {
      if (current.includes(playerId)) {
        return current.filter((id) => id !== playerId);
      }
      return [...current, playerId];
    });
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    await onSubmit({
      tournament_id: Number(tournamentId),
      name: name.trim() || undefined,
      number,
      players: selectedPlayerIds.map((playerId) => ({ player_id: playerId })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Tournament</label>
        {availableTournaments.length > 0 ? (
          <select
            value={tournamentId}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setTournamentId(Number(event.target.value))}
            className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50"
            disabled={disabled}
            required
          >
            {availableTournaments.map((tournament) => (
              <option key={tournament.id} value={tournament.id}>
                {tournament.name}
              </option>
            ))}
          </select>
        ) : (
          <p className="text-sm text-slate-500">No tournaments available yet.</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Name</label>
        <Input
          value={name}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
          placeholder="Enter group name"
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Number</label>
        <Input
          type="number"
          value={number}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNumber(Number(event.target.value))}
          placeholder="Enter group number"
          disabled={disabled}
          required
          min={1}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm font-medium text-slate-700">
          <span>Players</span>
          <span className="text-slate-500">Select players for this group</span>
        </div>

        {playersLoading ? (
          <p className="text-sm text-slate-500">Loading players…</p>
        ) : availablePlayers.length > 0 ? (
          <div className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
            {availablePlayers.map((player) => (
              <label
                key={player.id}
                className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-100"
              >
                <input
                  type="checkbox"
                  checked={selectedPlayerIds.includes(player.id)}
                  onChange={() => togglePlayer(player.id)}
                  disabled={disabled}
                />
                {player.name}
              </label>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No players available. Add players first.</p>
        )}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={disabled || !tournamentId || number < 1}>
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={disabled}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
