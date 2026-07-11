import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { CreateTournamentPage } from './CreateTournamentPage';
import { EditTournamentPage } from './EditTournamentPage';
import { TournamentsTable } from '../components/TournamentsTable';
import { useTournaments } from '../hooks/use-tournaments';
import type { TournamentInput } from '../types/tournaments';
import type { Tournament } from '../types/tournaments';

// Main page component for managing tournaments.
// Handles the different modes: list, create, and edit.
export default function TournamentsPage() {
  // Use the custom hook to manage tournament data and operations.
  const {
    tournaments,
    loading,
    error,
    createTournament,
    updateTournament,
    deleteTournament,
  } = useTournaments();

  // State to track the current mode of the page.
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');

  // State to store the tournament being edited.
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  // State for form errors.
  const [formError, setFormError] = useState<string | null>(null);

  // Memoized value for the tournament being edited.
  // This helps avoid unnecessary re-renders.
  const editTarget = useMemo(() => selectedTournament, [selectedTournament]);

  // Function to switch to create mode.
  const openCreate = () => {
    setFormError(null);
    setSelectedTournament(null);
    setMode('create');
  };

  // Function to switch to edit mode for a specific tournament.
  const openEdit = (tournament: Tournament) => {
    setFormError(null);
    setSelectedTournament(tournament);
    setMode('edit');
  };

  // Function to switch back to list mode.
  const closeForm = () => {
    setFormError(null);
    setSelectedTournament(null);
    setMode('list');
  };

  // Function to handle creating a new tournament.
  const handleCreate = async (input: TournamentInput) => {
    setFormError(null);

    // Basic validation.
    if (!input.name.trim()) {
      setFormError('Tournament name is required.');
      return;
    }

    try {
      await createTournament(input);
      closeForm();
    } catch (err) {
      setFormError('Could not save the new tournament.');
    }
  };

  // Function to handle updating an existing tournament.
  const handleUpdate = async (input: TournamentInput) => {
    if (!selectedTournament) {
      setFormError('No tournament selected for editing.');
      return;
    }

    // Basic validation.
    if (!input.name.trim()) {
      setFormError('Tournament name is required.');
      return;
    }

    try {
      await updateTournament(selectedTournament.id, input);
      closeForm();
    } catch (err) {
      setFormError('Could not update the tournament.');
    }
  };

  // Function to handle deleting a tournament.
  const handleDelete = async (tournament: Tournament) => {
    await deleteTournament(tournament.id);
  };

  // Render the page based on the current mode.
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header section */}
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Tournaments</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            Manage tournament details
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Create, edit, and remove tournaments using the backend tournaments API.
          </p>
        </div>
        <Button onClick={openCreate}>Create tournament</Button>
      </div>

      {/* Create form */}
      {mode === 'create' ? (
        <CreateTournamentPage
          onCreate={handleCreate}
          onCancel={closeForm}
          loading={loading}
          error={formError ?? error}
        />
      ) : null}

      {/* Edit form */}
      {mode === 'edit' && editTarget ? (
        <EditTournamentPage
          tournament={editTarget}
          onUpdate={handleUpdate}
          onCancel={closeForm}
          loading={loading}
          error={formError ?? error}
        />
      ) : null}

      {/* Tournaments list */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Tournament list</h2>
            <p className="text-sm text-slate-500">See all tournaments and open the editor to update details.</p>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
        <TournamentsTable tournaments={tournaments} loading={loading} onEdit={openEdit} onDelete={handleDelete} />
      </section>
    </main>
  );
}