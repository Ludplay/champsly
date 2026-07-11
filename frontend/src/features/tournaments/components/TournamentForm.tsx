import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { TournamentInput } from '../types/tournaments';
import type { Player } from '@/features/players/types/players';

type TournamentFormProps = {
  defaultName?: string;
  defaultGroupsQuantity?: number;
  defaultPhasesQuantity?: number;
  defaultStatus?: string;
  availablePlayers?: Player[];
  defaultPlayerIds?: number[];
  playersLoading?: boolean;
  submitLabel: string;
  error?: string | null;
  disabled?: boolean;
  onCancel?: () => void;
  onSubmit: (tournament: TournamentInput) => void | Promise<void>;
};

export function TournamentForm({
  defaultName = '',
  defaultGroupsQuantity = 1,
  defaultPhasesQuantity = 1,
  defaultStatus = 'active',
  availablePlayers = [],
  defaultPlayerIds,
  playersLoading = false,
  submitLabel,
  error,
  disabled = false,
  onCancel,
  onSubmit,
}: TournamentFormProps) {
  const [name, setName] = useState(defaultName);
  const [groupsQuantity, setGroupsQuantity] = useState(defaultGroupsQuantity);
  const [phasesQuantity, setPhasesQuantity] = useState(defaultPhasesQuantity);
  const [status, setStatus] = useState(defaultStatus);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>(defaultPlayerIds ?? []);

  const defaultPlayerIdsKey = defaultPlayerIds ? defaultPlayerIds.join(',') : '';

  useEffect(() => {
    setName(defaultName);
    setGroupsQuantity(defaultGroupsQuantity);
    setPhasesQuantity(defaultPhasesQuantity);
    setStatus(defaultStatus);
    setSelectedPlayerIds(defaultPlayerIds ?? []);
  }, [defaultName, defaultGroupsQuantity, defaultPhasesQuantity, defaultStatus, defaultPlayerIdsKey]);

  const togglePlayer = (playerId: number) => {
    setSelectedPlayerIds((current) => {
      if (current.includes(playerId)) {
        return current.filter((id) => id !== playerId);
      }

      return [...current, playerId];
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({
      name: name.trim(),
      groups_quantity: groupsQuantity,
      phases_quantity: phasesQuantity,
      status: status,
      players: selectedPlayerIds.map((playerId) => ({ player_id: playerId })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Name</label>
        <Input
          value={name}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
          placeholder="Enter tournament name"
          disabled={disabled}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Groups Quantity</label>
        <Input
          type="number"
          value={groupsQuantity}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setGroupsQuantity(Number(event.target.value))}
          placeholder="Enter number of groups"
          disabled={disabled}
          min={1}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Phases Quantity</label>
        <Input
          type="number"
          value={phasesQuantity}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPhasesQuantity(Number(event.target.value))}
          placeholder="Enter number of phases"
          disabled={disabled}
          min={1}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Status</label>
        <select
          value={status}
          onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setStatus(event.target.value)}
          className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50"
          disabled={disabled}
          required
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm font-medium text-slate-700">
          <span>Players</span>
          <span className="text-slate-500">Select players for this tournament</span>
        </div>

        {playersLoading ? (
          <p className="text-sm text-slate-500">Loading players…</p>
        ) : availablePlayers && availablePlayers.length > 0 ? (
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

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={disabled || !name.trim()}>
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
