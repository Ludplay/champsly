import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { PhaseInput } from '../types/phases';
import type { Tournament } from '@/features/tournaments/types/tournaments';

type PhaseFormProps = {
  defaultTournamentId?: number;
  defaultName?: string;
  defaultStatus?: string;
  defaultNumber?: number;
  availableTournaments?: Tournament[];
  submitLabel: string;
  error?: string | null;
  disabled?: boolean;
  onCancel?: () => void;
  onSubmit: (phase: PhaseInput) => void | Promise<void>;
};

export function PhaseForm({
  defaultTournamentId,
  defaultName = '',
  defaultStatus = 'active',
  defaultNumber = 1,
  availableTournaments = [],
  submitLabel,
  error,
  disabled = false,
  onCancel,
  onSubmit,
}: PhaseFormProps) {
  const initialTournamentId = defaultTournamentId ?? availableTournaments[0]?.id ?? 0;
  const [tournamentId, setTournamentId] = useState(initialTournamentId);
  const [name, setName] = useState(defaultName);
  const [status, setStatus] = useState(defaultStatus);
  const [number, setNumber] = useState(defaultNumber);

  useEffect(() => {
    const resolvedTournamentId = defaultTournamentId ?? availableTournaments[0]?.id ?? 0;
    setTournamentId(resolvedTournamentId);
    setName(defaultName);
    setStatus(defaultStatus);
    setNumber(defaultNumber);
  }, [defaultTournamentId, defaultName, defaultStatus, defaultNumber, availableTournaments]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({
      tournament_id: Number(tournamentId),
      name: name.trim(),
      status,
      number,
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
          placeholder="Enter phase name"
          disabled={disabled}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Number</label>
        <Input
          type="number"
          value={number}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNumber(Number(event.target.value))}
          placeholder="Enter phase number"
          disabled={disabled}
          required
          min={1}
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

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={disabled || !tournamentId || !name.trim() || number < 1}>
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
